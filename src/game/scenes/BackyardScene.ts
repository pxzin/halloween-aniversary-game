import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { inventory, selectedItem } from '../../ui/stores';
import { get } from 'svelte/store';
import { createClickableRect, DEBUG_COLORS, enableDebugToggle, clearDebugElements } from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';

/**
 * Backyard Scene - Cat's Treasure Puzzle (Puzzle 04)
 * Player must light the grill to see, then solve the cat puzzle to get Living Room Key
 */
export class BackyardScene extends Phaser.Scene {
  private hasShownIntroDialogue: boolean = false;
  private grillLit: boolean = false;
  private sanitizerCollected: boolean = false;
  private catFoodCollected: boolean = false;
  private catLured: boolean = false;
  private keyCollected: boolean = false;
  private diaryCollected: boolean = false;

  // Store zone references
  private returnZone: Phaser.GameObjects.Rectangle | null = null;
  private sanitizerZone: Phaser.GameObjects.Rectangle | null = null;
  private grillZone: Phaser.GameObjects.Rectangle | null = null;
  private catHouseZone: Phaser.GameObjects.Rectangle | null = null;
  private catFoodZone: Phaser.GameObjects.Rectangle | null = null;
  private tableZone: Phaser.GameObjects.Rectangle | null = null;
  private diaryZone: Phaser.GameObjects.Rectangle | null = null;

  // Visual elements
  private backgroundImage: Phaser.GameObjects.Image | null = null;
  private returnText: Phaser.GameObjects.Text | null = null;
  private catSprite: Phaser.GameObjects.Sprite | null = null;
  private keyIcon: Phaser.GameObjects.Text | null = null;
  private openCanSprite: Phaser.GameObjects.Sprite | null = null;
  private closedCanSprite: Phaser.GameObjects.Sprite | null = null;
  private sanitizerSprite: Phaser.GameObjects.Sprite | null = null;
  private diaryIcon: Phaser.GameObjects.Text | null = null;

  // Store bound function references for proper cleanup
  private boundOnDialogueEnded!: () => void;

  constructor() {
    super({ key: 'BackyardScene' });
  }

  preload(): void {
    // Load backyard backgrounds - dark (initial) and fire (when grill is lit)
    this.load.image('backyard_dark', '/assets/images/backgrounds/backyard_dark.png');
    this.load.image('backyard_fire', '/assets/images/backgrounds/backyard_fire.png');

    // Load black cat sprite for puzzle
    this.load.image('black_cat', '/assets/images/ui/black_cat_puzzle.png');

    // Load cat food can sprites
    this.load.image('cat_food_closed', '/assets/images/ui/cat_food_can_closed.png');
    this.load.image('cat_food_open', '/assets/images/ui/cat_food_can_open.png');

    // Load sanitizer sprite
    this.load.image('sanitizer', '/assets/images/ui/sanitizer.png');
  }

  create(): void {
    console.log('BackyardScene.create() called');

    // Show inventory (it's hidden during intro)
    EventBus.emit('show-inventory');

    // Load saved state from sessionStorage
    const savedState = sessionStorage.getItem('backyardSceneState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.hasShownIntroDialogue = state.hasShownIntroDialogue || false;
      this.grillLit = state.grillLit || false;
      this.sanitizerCollected = state.sanitizerCollected || false;
      this.catFoodCollected = state.catFoodCollected || false;
      this.catLured = state.catLured || false;
      this.keyCollected = state.keyCollected || false;
      this.diaryCollected = state.diaryCollected || false;
      console.log('Loaded BackyardScene state:', state);
    } else {
      // First time in scene - initialize state
      this.hasShownIntroDialogue = false;
      this.grillLit = false;
      this.sanitizerCollected = false;
      this.catFoodCollected = false;
      this.catLured = false;
      this.keyCollected = false;
      this.diaryCollected = false;
    }

    // Reset zone references
    this.returnZone = null;
    this.sanitizerZone = null;
    this.grillZone = null;
    this.catHouseZone = null;
    this.catFoodZone = null;
    this.tableZone = null;
    this.diaryZone = null;
    this.backgroundImage = null;
    this.returnText = null;
    this.catSprite = null;
    this.keyIcon = null;
    this.openCanSprite = null;
    this.closedCanSprite = null;
    this.sanitizerSprite = null;
    this.diaryIcon = null;

    // Store bound functions for proper cleanup
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);

    // Listen for events
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);

    const { width, height } = this.cameras.main;

    // Display backyard background - dark initially, fire when grill is lit
    const backgroundKey = this.grillLit ? 'backyard_fire' : 'backyard_dark';
    this.backgroundImage = this.add.image(width / 2, height / 2, backgroundKey);

    // Scale to fit the game view while maintaining aspect ratio
    const scaleX = width / this.backgroundImage.width;
    const scaleY = height / this.backgroundImage.height;
    const scale = Math.max(scaleX, scaleY);
    this.backgroundImage.setScale(scale);

    console.log(`BackyardScene background loaded: ${backgroundKey} (scale: ${scale})`);

    // Create all interactive zones
    this.createReturnZone();
    this.createSanitizerZone();
    this.createGrillZone();
    this.createCatHouseZone();
    this.createCatFoodZone();
    this.createTableZone();
    this.createDiaryZone();

    // If cat was lured and player is returning, recreate cat and can on table
    if (this.catLured) {
      this.recreateCatOnTable();
    }

    // Enable debug tools (dev mode only)
    enableRectangleDrawTool(this);
    enableDebugToggle(this);

    // Show intro dialogue if first time
    if (!this.hasShownIntroDialogue) {
      this.disableAllZones();
      DialogueManager.loadScript('backyard', 'backyard_intro').then(() => {
        DialogueManager.startDialogue();
      });
    } else {
      // Returning to scene - enable zones immediately
      this.enableAllZones();
    }

    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    console.log('BackyardScene created');
  }

  /**
   * Create return zone
   */
  private createReturnZone(): void {
    // Bottom-left corner return zone (door/exit area)
    const centerX = 82.04;
    const centerY = 634.80;
    const width = 150.35;
    const height = 157.03;

    this.returnZone = createClickableRect(this, centerX, centerY, width, height, undefined, DEBUG_COLORS.NAVIGATION, 'Return');
    this.returnZone.on('pointerdown', () => this.onReturnClicked());

    this.returnText = this.add.text(centerX, centerY, '← Voltar', {
      fontSize: '18px',
      color: '#ffffff',
    });
    this.returnText.setOrigin(0.5);
  }

  /**
   * Create hand sanitizer zone
   */
  private createSanitizerZone(): void {
    // Real coordinates from background (above washing machine)
    const centerX = 1162.88;
    const centerY = 358.33;
    const width = 83.53;
    const height = 85.20;

    // Create sanitizer sprite if not collected
    if (!this.sanitizerCollected) {
      this.sanitizerSprite = this.add.sprite(centerX, centerY, 'sanitizer');
      this.sanitizerSprite.setScale(0.105); // 30% smaller (0.15 * 0.7)
      this.sanitizerSprite.setDepth(5);
      // Apply darker filter to blend with dark scene
      this.sanitizerSprite.setTint(0x888888);
      this.sanitizerSprite.setAlpha(0.85); // Slightly transparent
    }

    this.sanitizerZone = createClickableRect(this, centerX, centerY, width, height, undefined, DEBUG_COLORS.ITEM, 'Sanitizer');
    this.sanitizerZone.setDepth(10);
    this.sanitizerZone.on('pointerdown', () => this.onSanitizerClicked());

    if (this.sanitizerCollected && this.sanitizerZone) {
      this.sanitizerZone.disableInteractive();
    }
  }

  /**
   * Create grill zone
   */
  private createGrillZone(): void {
    // Real coordinates from background (barbecue grill)
    const centerX = 75.36;
    const centerY = 344.97;
    const width = 133.64;
    const height = 145.34;

    this.grillZone = createClickableRect(this, centerX, centerY, width, height, undefined, DEBUG_COLORS.CLICKABLE, 'Grill');
    this.grillZone.setDepth(10);
    this.grillZone.on('pointerdown', () => this.onGrillClicked());
  }

  /**
   * Create cat house zone
   */
  private createCatHouseZone(): void {
    // Real coordinates from background (cat house on shelf)
    const centerX = 790.35;
    const centerY = 149.51;
    const width = 66.82;
    const height = 75.17;

    // Create cat sprite if cat hasn't been lured yet
    if (!this.catLured) {
      this.catSprite = this.add.sprite(centerX, centerY, 'black_cat');
      this.catSprite.setScale(0.1); // Much smaller cat sprite
      this.catSprite.setDepth(5);

      // Apply dark filter if grill is not lit
      if (!this.grillLit) {
        this.catSprite.setTint(0x333333); // Dark tint
        this.catSprite.setAlpha(0.5); // Low visibility
      }
    } else if (this.catLured && !this.keyCollected) {
      // Show key icon in cat house after cat is lured
      this.keyIcon = this.add.text(centerX, centerY, '🔑', {
        fontSize: '32px'
      }).setOrigin(0.5);
      this.keyIcon.setDepth(5);
    }

    this.catHouseZone = createClickableRect(this, centerX, centerY, width, height, undefined, DEBUG_COLORS.HOTSPOT, 'Cat House');
    this.catHouseZone.setDepth(10);
    this.catHouseZone.on('pointerdown', () => this.onCatHouseClicked());
  }

  /**
   * Create cat food zone
   */
  private createCatFoodZone(): void {
    // Real coordinates from background (cat food in cabinet)
    const centerX = 408.63;
    const centerY = 373.36;
    const width = 118.61;
    const height = 101.90;

    // Create closed cat food can sprite if not collected
    if (!this.catFoodCollected) {
      this.closedCanSprite = this.add.sprite(centerX, centerY, 'cat_food_closed');
      this.closedCanSprite.setScale(0.084); // 20% smaller (0.105 * 0.8)
      this.closedCanSprite.setDepth(5);
      // Apply much darker filter to blend with dark scene
      this.closedCanSprite.setTint(0x555555);
      this.closedCanSprite.setAlpha(0.75); // More transparent
    }

    this.catFoodZone = createClickableRect(this, centerX, centerY, width, height, undefined, DEBUG_COLORS.ITEM, 'Cat Food');
    this.catFoodZone.setDepth(10);
    this.catFoodZone.on('pointerdown', () => this.onCatFoodClicked());

    if (this.catFoodCollected && this.catFoodZone) {
      this.catFoodZone.disableInteractive();
    }
  }

  /**
   * Create table zone
   */
  private createTableZone(): void {
    // Real coordinates from background (central table)
    const centerX = 609.09;
    const centerY = 496.15;
    const width = 419.31;
    const height = 90.21;

    this.tableZone = createClickableRect(this, centerX, centerY, width, height, undefined, DEBUG_COLORS.CLICKABLE, 'Table');
    this.tableZone.setDepth(10);
    this.tableZone.on('pointerdown', () => this.onTableClicked());
  }

  /**
   * Create Ric's diary zone
   */
  private createDiaryZone(): void {
    // Real coordinates from background (Ric's diary location)
    const centerX = 937.36;
    const centerY = 365.85;
    const width = 86.87;
    const height = 73.50;

    // Create diary icon if not collected
    if (!this.diaryCollected) {
      this.diaryIcon = this.add.text(centerX, centerY, '📔', {
        fontSize: '32px'
      }).setOrigin(0.5);
      this.diaryIcon.setDepth(5);
      // Apply dark filter to blend with scene
      this.diaryIcon.setAlpha(0.8);
    }

    this.diaryZone = createClickableRect(this, centerX, centerY, width, height, undefined, DEBUG_COLORS.ITEM, 'Diary');
    this.diaryZone.setDepth(10);
    this.diaryZone.on('pointerdown', () => this.onDiaryClicked());

    if (this.diaryCollected && this.diaryZone) {
      this.diaryZone.disableInteractive();
    }
  }

  /**
   * Handle sanitizer clicked
   */
  private onSanitizerClicked(): void {
    if (this.sanitizerCollected) {
      return;
    }

    console.log('Sanitizer collected');
    this.sanitizerCollected = true;
    this.saveState();

    // Hide sprite
    if (this.sanitizerSprite) {
      this.sanitizerSprite.setVisible(false);
    }

    // Disable zone
    if (this.sanitizerZone) {
      this.sanitizerZone.disableInteractive();
    }

    // Show dialogue
    this.disableAllZones();
    DialogueManager.loadScript('backyard', 'found_sanitizer').then(() => {
      DialogueManager.startDialogue();
    });

    // Trigger item acquisition animation after dialogue ends
    EventBus.once('dialogue-ended', () => {
      EventBus.emit('item-acquired', {
        id: 'hand_sanitizer',
        name: 'Álcool em Gel',
        icon: '🧴'
      });
    });
  }

  /**
   * Handle grill clicked
   */
  private onGrillClicked(): void {
    const selected = get(selectedItem);

    if (!selected) {
      // Just examining
      if (!this.grillLit) {
        EventBus.emit('show-dialogue', {
          character: 'jessica',
          text: 'Uma churrasqueira. Preciso de algo para acendê-la.'
        });
      } else {
        EventBus.emit('show-dialogue', {
          character: 'jessica',
          text: 'A churrasqueira está acesa, iluminando o quintal.'
        });
      }
      return;
    }

    // Using hand sanitizer on grill
    if (selected.id === 'hand_sanitizer') {
      console.log('Using hand sanitizer on grill');
      // Remove sanitizer from inventory
      inventory.update(items => items.filter(i => i.id !== 'hand_sanitizer'));
      // Clear selection
      selectedItem.set(null);

      // Show inline dialogue (doesn't disable zones)
      EventBus.emit('show-dialogue', {
        character: 'jessica',
        text: 'Despejei o álcool na churrasqueira. Agora preciso acendê-la com o isqueiro.'
      });
      return;
    }

    // Using lighter on grill (with sanitizer already applied)
    if (selected.id === 'lighter' && !this.grillLit) {
      console.log('Using lighter on grill');
      this.grillLit = true;
      this.saveState();
      // Keep lighter
      selectedItem.set(null);

      // Switch to fire background
      if (this.backgroundImage) {
        this.backgroundImage.setTexture('backyard_fire');
        console.log('Background switched to backyard_fire');
      }

      // Remove dark filter from cat sprite
      if (this.catSprite && !this.catLured) {
        this.catSprite.clearTint();
        this.catSprite.setAlpha(1);
      }

      this.disableAllZones();
      DialogueManager.loadScript('backyard', 'grill_lit').then(() => {
        DialogueManager.startDialogue();
      });
      return;
    }

    // Clear selection
    selectedItem.set(null);
  }

  /**
   * Handle cat house clicked
   */
  private onCatHouseClicked(): void {
    const selected = get(selectedItem);

    if (!selected) {
      // Just examining
      if (!this.catLured) {
        // Show cat_house_high dialogue (works even in the dark)
        this.disableAllZones();
        DialogueManager.loadScript('backyard', 'cat_house_high').then(() => {
          DialogueManager.startDialogue();
        });
      } else {
        // Cat has been lured away
        EventBus.emit('show-dialogue', {
          character: 'jessica',
          text: 'A casinha está vazia agora. Mas ainda está muito alta...'
        });
      }
      return;
    }

    // Using broom on cat house (after cat is lured)
    if (selected.id === 'broom' && this.catLured && !this.keyCollected) {
      console.log('Using broom on cat house to get key');
      this.keyCollected = true;
      this.saveState();
      // Keep broom
      selectedItem.set(null);

      // Hide key icon from cat house
      if (this.keyIcon) {
        this.keyIcon.setVisible(false);
      }

      // Show dialogue with spider floor reaction
      this.disableAllZones();
      DialogueManager.loadScript('backyard', 'found_living_room_key').then(() => {
        DialogueManager.startDialogue();
      });

      // Trigger item acquisition animation after dialogue ends
      EventBus.once('dialogue-ended', () => {
        EventBus.emit('item-acquired', {
          id: 'living_room_key',
          name: 'Chave da Sala',
          icon: '🔑'
        });
      });
      return;
    }

    // Clear selection
    selectedItem.set(null);
  }

  /**
   * Handle cat food clicked
   */
  private onCatFoodClicked(): void {
    if (this.catFoodCollected) {
      return;
    }

    console.log('Cat food collected');
    this.catFoodCollected = true;
    this.saveState();

    // Hide sprite
    if (this.closedCanSprite) {
      this.closedCanSprite.setVisible(false);
    }

    // Disable zone
    if (this.catFoodZone) {
      this.catFoodZone.disableInteractive();
    }

    // Show dialogue
    this.disableAllZones();
    DialogueManager.loadScript('backyard', 'found_cat_food').then(() => {
      DialogueManager.startDialogue();
    });

    // Trigger item acquisition animation after dialogue ends
    EventBus.once('dialogue-ended', () => {
      EventBus.emit('item-acquired', {
        id: 'cat_food_can',
        name: 'Lata de Ração',
        icon: '/assets/images/ui/cat_food_can_closed.png'
      });
    });
  }

  /**
   * Handle diary clicked
   */
  private onDiaryClicked(): void {
    if (this.diaryCollected) {
      return;
    }

    console.log('Ric\'s diary collected');
    this.diaryCollected = true;
    this.saveState();

    // Hide icon
    if (this.diaryIcon) {
      this.diaryIcon.setVisible(false);
    }

    // Disable zone
    if (this.diaryZone) {
      this.diaryZone.disableInteractive();
    }

    // Show dialogue
    this.disableAllZones();
    DialogueManager.loadScript('backyard', 'found_rics_diary').then(() => {
      DialogueManager.startDialogue();
    });

    // Trigger item acquisition animation after dialogue ends
    EventBus.once('dialogue-ended', () => {
      EventBus.emit('item-acquired', {
        id: 'rics_diary',
        name: 'Diário do Ric',
        icon: '📔'
      });
    });
  }

  /**
   * Handle table clicked
   */
  private onTableClicked(): void {
    const selected = get(selectedItem);

    if (!selected) {
      // Just examining
      if (this.catLured) {
        // Cat is on the table - show random dialogue
        const catDialogues = [
          'cat_on_table_1',
          'cat_on_table_2',
          'cat_on_table_3',
          'cat_on_table_4'
        ];
        const randomDialogue = catDialogues[Math.floor(Math.random() * catDialogues.length)];

        this.disableAllZones();
        DialogueManager.loadScript('backyard', randomDialogue).then(() => {
          DialogueManager.startDialogue();
        });
      } else {
        // Just a table - inline dialogue doesn't block interaction
        EventBus.emit('show-dialogue', {
          character: 'jessica',
          text: 'Uma mesa no centro do quintal.'
        });
      }
      return;
    }

    // Using open cat food can on table
    if (selected.id === 'open_cat_food_can' && !this.catLured) {
      console.log('Placing open cat food on table');
      this.catLured = true;
      this.saveState();

      // Remove open can from inventory
      inventory.update(items => items.filter(i => i.id !== 'open_cat_food_can'));
      // Clear selection
      selectedItem.set(null);

      // Move cat from house to table
      if (this.catSprite) {
        // Animate cat moving to table
        const tableCenterX = 609.09;
        const tableCenterY = 496.15 - 80; // Above table

        this.tweens.add({
          targets: this.catSprite,
          x: tableCenterX,
          y: tableCenterY,
          duration: 1500,
          ease: 'Power2',
          onComplete: () => {
            console.log('Cat moved to table');
          }
        });
      }

      // Create open cat food can sprite on table
      if (!this.openCanSprite) {
        const tableCenterX = 609.09;
        const tableCenterY = 496.15 - 20; // On table, in front of cat

        this.openCanSprite = this.add.sprite(tableCenterX, tableCenterY, 'cat_food_open');
        this.openCanSprite.setScale(0.084); // 20% smaller (0.105 * 0.8)
        this.openCanSprite.setDepth(6); // Higher than cat (depth 5) to be in front
        this.openCanSprite.setAlpha(0);
        // Apply filter to blend with scene (darker filter even with grill lit)
        this.openCanSprite.setTint(0x888888);

        // Fade in open can
        this.tweens.add({
          targets: this.openCanSprite,
          alpha: 1,
          duration: 500,
          delay: 500
        });
      }

      // Show key icon in cat house after cat leaves
      if (!this.keyIcon) {
        const catHouseX = 790.35;
        const catHouseY = 149.51;
        this.keyIcon = this.add.text(catHouseX, catHouseY, '🔑', {
          fontSize: '32px'
        }).setOrigin(0.5);
        this.keyIcon.setDepth(5);
        this.keyIcon.setAlpha(0);

        // Fade in key after cat moves
        this.tweens.add({
          targets: this.keyIcon,
          alpha: 1,
          duration: 500,
          delay: 1500
        });
      }

      this.disableAllZones();
      DialogueManager.loadScript('backyard', 'cat_lured').then(() => {
        DialogueManager.startDialogue();
      });
      return;
    }

    // Clear selection
    selectedItem.set(null);
  }

  /**
   * Handle return clicked
   */
  private onReturnClicked(): void {
    console.log('Returning to HallwayScene');
    this.cleanupEventListeners();
    this.scene.start('HallwayScene');
  }


  /**
   * Recreate cat and can on table when returning to scene
   */
  private recreateCatOnTable(): void {
    const tableCenterX = 609.09;
    const tableCenterY = 496.15 - 80; // Above table

    // Recreate cat sprite on table
    if (!this.catSprite) {
      this.catSprite = this.add.sprite(tableCenterX, tableCenterY, 'black_cat');
      this.catSprite.setScale(0.1);
      this.catSprite.setDepth(5);
      // Cat is fully visible when on table
      this.catSprite.clearTint();
      this.catSprite.setAlpha(1);
    }

    // Recreate open can sprite on table
    if (!this.openCanSprite) {
      const canY = 496.15 - 20; // On table, in front of cat
      this.openCanSprite = this.add.sprite(tableCenterX, canY, 'cat_food_open');
      this.openCanSprite.setScale(0.084); // 20% smaller (0.105 * 0.8)
      this.openCanSprite.setDepth(6); // In front of cat
      // Apply darker filter to blend with scene
      this.openCanSprite.setTint(0x888888);
    }
  }

  /**
   * Handle dialogue ended
   */
  private onDialogueEnded(): void {
    console.log('[BackyardScene] Dialogue ended');

    // Only proceed if this scene is active
    if (!this.scene.isActive('BackyardScene')) {
      console.log('[BackyardScene] Scene not active, ignoring dialogue-ended event');
      return;
    }

    if (!this.hasShownIntroDialogue) {
      this.hasShownIntroDialogue = true;
      this.saveState();
    }

    this.enableAllZones();
  }

  /**
   * Disable all interactive zones
   */
  private disableAllZones(): void {
    this.returnZone?.disableInteractive();

    if (!this.sanitizerCollected) {
      this.sanitizerZone?.disableInteractive();
    }

    this.grillZone?.disableInteractive();
    this.catHouseZone?.disableInteractive();

    if (!this.catFoodCollected) {
      this.catFoodZone?.disableInteractive();
    }

    if (!this.diaryCollected) {
      this.diaryZone?.disableInteractive();
    }

    this.tableZone?.disableInteractive();
  }

  /**
   * Enable all interactive zones
   */
  private enableAllZones(): void {
    console.log('[BackyardScene] Enabling all zones');

    if (this.returnZone) {
      this.returnZone.setInteractive({ useHandCursor: true });
      console.log('  ✓ Return zone enabled');
    }

    if (!this.sanitizerCollected && this.sanitizerZone) {
      this.sanitizerZone.setInteractive({ useHandCursor: true });
      console.log('  ✓ Sanitizer zone enabled');
    }

    if (this.grillZone) {
      this.grillZone.setInteractive({ useHandCursor: true });
      console.log('  ✓ Grill zone enabled');
    }

    if (this.catHouseZone) {
      this.catHouseZone.setInteractive({ useHandCursor: true });
      console.log('  ✓ Cat house zone enabled');
    }

    if (!this.catFoodCollected && this.catFoodZone) {
      this.catFoodZone.setInteractive({ useHandCursor: true });
      console.log('  ✓ Cat food zone enabled');
    }

    if (!this.diaryCollected && this.diaryZone) {
      this.diaryZone.setInteractive({ useHandCursor: true });
      console.log('  ✓ Diary zone enabled');
    }

    if (this.tableZone) {
      this.tableZone.setInteractive({ useHandCursor: true });
      console.log('  ✓ Table zone enabled');
    }

    console.log('[BackyardScene] All zones enabled');
  }

  /**
   * Save scene state to sessionStorage
   */
  private saveState(): void {
    const state = {
      hasShownIntroDialogue: this.hasShownIntroDialogue,
      grillLit: this.grillLit,
      sanitizerCollected: this.sanitizerCollected,
      catFoodCollected: this.catFoodCollected,
      catLured: this.catLured,
      keyCollected: this.keyCollected,
      diaryCollected: this.diaryCollected,
    };
    sessionStorage.setItem('backyardSceneState', JSON.stringify(state));
    console.log('Saved BackyardScene state:', state);
  }

  /**
   * Toggle debug visibility
   */
  private toggleDebug(): void {
    // Implementation handled by enableDebugToggle
  }

  /**
   * Cleanup event listeners
   */
  private cleanupEventListeners(): void {
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    clearDebugElements();
  }

  /**
   * Phaser lifecycle: cleanup when scene shuts down
   */
  shutdown(): void {
    console.log('BackyardScene.shutdown() called');
    this.cleanupEventListeners();
  }
}
