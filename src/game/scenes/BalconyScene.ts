import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { inventory } from '../../ui/stores';
import type { Item } from '../../ui/stores';
import { createClickableRect, DEBUG_COLORS } from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';

/**
 * Balcony Scene - Scene with plant pots and Val Kilmer (the cat)
 * Player can find the miniature rake and solve the cat puzzle to get the Hallway Key
 */
export class BalconyScene extends Phaser.Scene {
  private hasShownIntroDialogue: boolean = false;
  private rakeFound: boolean = false;
  private keyFound: boolean = false;

  // Store zone references
  private returnZone: Phaser.GameObjects.Rectangle | null = null;
  private plantPotZones: Phaser.GameObjects.Rectangle[] = [];
  private rakePotZone: Phaser.GameObjects.Rectangle | null = null;
  private catZone: Phaser.GameObjects.Rectangle | null = null;

  // Visual elements
  private rakeVisual: Phaser.GameObjects.Image | null = null;
  private keyVisual: Phaser.GameObjects.Image | null = null;
  private catVisual: Phaser.GameObjects.Image | null = null;
  private returnText: Phaser.GameObjects.Text | null = null;

  // Store bound function references for proper cleanup
  private boundOnDialogueEnded!: () => void;
  private boundOnChoiceMade!: (data: { choiceIndex: number }) => void;

  // Track empty pot dialogues already shown
  private shownEmptyPotDialogues: Set<number> = new Set();

  constructor() {
    super({ key: 'BalconyScene' });
  }

  preload(): void {
    // Load balcony background
    this.load.image('balcony', '/assets/images/backgrounds/balcony_darker.png');

    // Load Val Kilmer (cat) sprite
    this.load.image('cat_sleeping', '/assets/images/ui/cat_puzzle_sleeping.png');

    // TODO: Load rake and key sprites (using placeholders for now)
    // this.load.image('miniature_rake', '/assets/images/items/miniature_rake.png');
    // this.load.image('hallway_key', '/assets/images/items/hallway_key.png');
  }

  create(): void {
    console.log('BalconyScene.create() called');

    // Load saved state from sessionStorage
    const savedState = sessionStorage.getItem('balconySceneState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.hasShownIntroDialogue = state.hasShownIntroDialogue || false;
      this.rakeFound = state.rakeFound || false;
      this.keyFound = state.keyFound || false;
      console.log('Loaded BalconyScene state:', state);
    } else {
      // First time in scene - initialize state
      this.hasShownIntroDialogue = false;
      this.rakeFound = false;
      this.keyFound = false;
    }
    this.returnZone = null;
    this.plantPotZones = [];
    this.rakePotZone = null;
    this.catZone = null;
    this.rakeVisual = null;
    this.keyVisual = null;
    this.catVisual = null;
    this.returnText = null;
    this.shownEmptyPotDialogues = new Set();

    // Store bound functions for proper cleanup
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);
    this.boundOnChoiceMade = this.onChoiceMade.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.off('choice-made', this.boundOnChoiceMade);

    // Listen for events
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.on('choice-made', this.boundOnChoiceMade);

    const { width, height } = this.cameras.main;

    // Display balcony background - centered and scaled to fit
    const balcony = this.add.image(width / 2, height / 2, 'balcony');

    // Scale to fit the game view while maintaining aspect ratio
    const scaleX = width / balcony.width;
    const scaleY = height / balcony.height;
    const scale = Math.max(scaleX, scaleY);
    balcony.setScale(scale);

    // Create interactive zones (will be enabled after intro dialogue)
    this.createInteractiveZones();

    // Enable rectangle draw tool (dev mode only)
    enableRectangleDrawTool(this);

    // Fade in from black
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Start intro dialogue after fade in (only if not shown before)
    this.cameras.main.once('camerafadeincomplete', () => {
      if (!this.hasShownIntroDialogue) {
        this.startIntroDialogue();
      } else {
        // Returning to scene - enable zones immediately
        this.enableAllZones();
      }
    });
  }

  /**
   * Start the balcony intro dialogue
   */
  private async startIntroDialogue(): Promise<void> {
    await DialogueManager.loadScript('balcony', 'balcony_intro');
    DialogueManager.startDialogue();
    this.hasShownIntroDialogue = true;
    this.saveState();
  }

  /**
   * Save scene state to sessionStorage
   */
  private saveState(): void {
    const state = {
      hasShownIntroDialogue: this.hasShownIntroDialogue,
      rakeFound: this.rakeFound,
      keyFound: this.keyFound,
    };
    sessionStorage.setItem('balconySceneState', JSON.stringify(state));
    console.log('Saved BalconyScene state:', state);
  }

  /**
   * Handle dialogue end event
   */
  private onDialogueEnded(): void {
    console.log('BalconyScene.onDialogueEnded');

    // Enable interaction zones after intro dialogue
    if (this.hasShownIntroDialogue) {
      this.enableAllZones();
    }
  }

  /**
   * Enable all interactive zones
   */
  private enableAllZones(): void {
    console.log('Enabling all zones, keyFound:', this.keyFound, 'rakeFound:', this.rakeFound);

    if (this.returnZone) {
      this.returnZone.setInteractive({ useHandCursor: true });
      console.log('Return zone enabled');
    }

    // Show return text
    if (this.returnText) {
      this.returnText.setVisible(true);
    }

    // Enable empty pot zones
    this.plantPotZones.forEach((zone, index) => {
      zone.setInteractive({ useHandCursor: true });
      console.log(`Empty pot zone ${index + 1} enabled`);
    });

    // Always enable rake pot zone (it becomes empty pot after collecting)
    if (this.rakePotZone) {
      this.rakePotZone.setInteractive({ useHandCursor: true });
      console.log('Rake pot zone enabled');
    }

    // Enable cat zone if key not found yet
    if (this.catZone) {
      if (!this.keyFound) {
        this.catZone.setInteractive({ useHandCursor: true });
        console.log('Cat zone enabled (key not found)');
      } else {
        console.log('Cat zone NOT enabled (key already found)');
      }
    }
  }

  /**
   * Create interactive zones for plant pots, cat, and return
   */
  private createInteractiveZones(): void {
    // Return to Stairs Zone
    this.returnZone = createClickableRect(
      this,
      1201.30, // centerX
      359.16,  // centerY
      140.33,  // width
      714.99,  // height
      false,   // showDebug disabled temporarily
      DEBUG_COLORS.NAVIGATION,
      'Return to Stairs'
    );
    this.returnZone.disableInteractive();
    this.returnZone.on('pointerdown', () => this.returnToStairs());

    // Create return text label (hidden initially)
    this.returnText = this.add.text(
      1201.30,
      359.16,
      'Voltar',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 16, y: 8 },
        stroke: '#ff6600',
        strokeThickness: 2,
      }
    );
    this.returnText.setOrigin(0.5, 0.5);
    this.returnText.setVisible(false); // Hidden until dialogue ends
    this.returnText.setDepth(1000); // Above everything

    // Empty Pot Zone 1
    const emptyPot1 = createClickableRect(
      this,
      918.15, // centerX
      405.10, // centerY
      91.88,  // width
      81.86,  // height
      false,  // showDebug disabled temporarily
      DEBUG_COLORS.ITEM,
      'Empty Pot 1'
    );
    emptyPot1.disableInteractive();
    emptyPot1.on('pointerdown', () => this.onEmptyPotClicked());
    this.plantPotZones.push(emptyPot1);

    // Empty Pot Zone 3
    const emptyPot3 = createClickableRect(
      this,
      336.80, // centerX
      431.00, // centerY
      98.56,  // width
      96.89,  // height
      false,  // showDebug disabled temporarily
      DEBUG_COLORS.ITEM,
      'Empty Pot 3'
    );
    emptyPot3.disableInteractive();
    emptyPot3.on('pointerdown', () => this.onEmptyPotClicked());
    this.plantPotZones.push(emptyPot3);

    // Rake Pot Zone (Vaso Vazio 2 - becomes empty after collecting rake)
    this.rakePotZone = createClickableRect(
      this,
      644.18,  // centerX
      344.97,  // centerY
      111.93,  // width
      409.28,  // height
      false,   // showDebug disabled temporarily
      DEBUG_COLORS.ITEM,
      'Rake Pot'
    );
    this.rakePotZone.disableInteractive();
    this.rakePotZone.on('pointerdown', () => this.onRakePotClicked());

    // TODO: Create rake visual (placeholder for now)
    // this.rakeVisual = this.add.image(644.18, 344.97, 'miniature_rake');
    // this.rakeVisual.setScale(0.5);

    // Cat Zone (Val Kilmer)
    this.catZone = createClickableRect(
      this,
      229.88,  // centerX
      643.16,  // centerY
      145.34,  // width
      143.67,  // height
      false,   // showDebug disabled temporarily
      DEBUG_COLORS.HOTSPOT,
      'Val Kilmer (Cat)'
    );
    this.catZone.disableInteractive();
    this.catZone.on('pointerdown', () => this.onCatClicked());

    // Create cat visual
    this.catVisual = this.add.image(229.88, 643.16, 'cat_sleeping');
    this.catVisual.setOrigin(0.5, 0.5);
    this.catVisual.setScale(0.15); // 15% of original size - smaller
    this.catVisual.setDepth(10); // Below clickable zones but above background

    // Apply lighter blue-gray tint to blend with background (less dark)
    this.catVisual.setTint(0x7a8aaa); // Lighter blue-gray tint

    // Keep alpha at 0.95 for better visibility
    this.catVisual.setAlpha(0.95);

    // TODO: Create key visual (hidden initially, placeholder for now)
    // this.keyVisual = this.add.image(229.88, 643.16, 'hallway_key');
    // this.keyVisual.setVisible(false);
  }

  /**
   * Handle empty pot click - show random dialogue
   */
  private async onEmptyPotClicked(): Promise<void> {
    console.log('Empty pot clicked');

    // Get random dialogue from the three options
    // But avoid repeating the same dialogue consecutively
    const dialogueIds = ['empty_pot_1', 'empty_pot_2', 'empty_pot_3'];

    // Filter out already shown dialogues if we haven't shown all yet
    let availableDialogues = dialogueIds;
    if (this.shownEmptyPotDialogues.size < dialogueIds.length) {
      availableDialogues = dialogueIds.filter((_, index) =>
        !this.shownEmptyPotDialogues.has(index)
      );
    } else {
      // Reset if all have been shown
      this.shownEmptyPotDialogues.clear();
    }

    // Pick random from available
    const randomIndex = Math.floor(Math.random() * availableDialogues.length);
    const selectedDialogue = availableDialogues[randomIndex];

    // Mark as shown
    const originalIndex = dialogueIds.indexOf(selectedDialogue);
    this.shownEmptyPotDialogues.add(originalIndex);

    await DialogueManager.loadScript('balcony', selectedDialogue);
    DialogueManager.startDialogue();
  }

  /**
   * Handle rake pot click - find the miniature rake
   */
  private async onRakePotClicked(): Promise<void> {
    console.log('Rake pot clicked, rakeFound:', this.rakeFound);

    if (this.rakeFound) {
      // Already found, behave as empty pot
      console.log('Rake already found, showing empty pot dialogue');
      this.onEmptyPotClicked();
      return;
    }

    console.log('Adding rake to inventory');
    // Add rake to inventory
    inventory.update(items => [...items, {
      id: 'miniature_rake',
      name: 'Mini-Rastelo de Jardim',
      icon: '🍴', // Placeholder icon
    }]);

    this.rakeFound = true;
    this.saveState();

    // Hide rake visual
    if (this.rakeVisual) {
      this.rakeVisual.setVisible(false);
    }

    // Don't disable the zone - it will now behave as empty pot
    // The zone stays interactive

    // Show dialogue
    console.log('Loading found_rake dialogue');
    await DialogueManager.loadScript('balcony', 'found_rake');
    DialogueManager.startDialogue();
  }

  /**
   * Handle cat click - show choice dialogue
   */
  private onCatClicked(): void {
    console.log('Cat clicked, keyFound:', this.keyFound);

    if (this.keyFound) {
      // Already found the key, do nothing
      console.log('Key already found, ignoring click');
      return;
    }

    console.log('Emitting show-choices event');
    // Show choice dialogue
    EventBus.emit('show-choices', {
      question: 'Como você quer fazer carinho no Val Kilmer?',
      choices: [
        'Fazer carinho na cabeça',
        'Fazer carinho na barriga',
        'Fazer carinho na bunda',
      ],
    });
  }

  /**
   * Handle choice made event
   */
  private async onChoiceMade(data: { choiceIndex: number }): Promise<void> {
    console.log('Choice made:', data.choiceIndex);

    const { choiceIndex } = data;

    // Option 2 (index 2) is the correct choice: "Fazer carinho na bunda"
    if (choiceIndex === 2) {
      // Success! Show success dialogue and give key
      await this.onCatPuzzleSuccess();
    } else {
      // Failure - show fail dialogue
      await DialogueManager.loadScript('balcony', 'cat_interaction_fail');
      DialogueManager.startDialogue();
    }
  }

  /**
   * Handle cat puzzle success
   */
  private async onCatPuzzleSuccess(): Promise<void> {
    console.log('Cat puzzle solved!');

    this.keyFound = true;
    this.saveState();

    // Show success dialogue
    await DialogueManager.loadScript('balcony', 'cat_interaction_success');
    DialogueManager.startDialogue();

    // Add key to inventory
    inventory.update(items => [...items, {
      id: 'hallway_key',
      name: 'Chave do Corredor',
      icon: '🔑', // Key icon
    }]);

    // Show key visual appearing
    if (this.keyVisual) {
      this.keyVisual.setVisible(true);

      // Animate key appearing (fade in + move up)
      this.tweens.add({
        targets: this.keyVisual,
        alpha: { from: 0, to: 1 },
        y: this.keyVisual.y - 20,
        duration: 1000,
        ease: 'Power2',
      });
    }

    // Disable cat zone
    if (this.catZone) {
      this.catZone.disableInteractive();
    }
  }

  /**
   * Return to StairsScene
   */
  private returnToStairs(): void {
    console.log('Returning to StairsScene');

    // Fade out
    this.cameras.main.fadeOut(500, 0, 0, 0);

    // Transition back to StairsScene when fade completes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.cleanupEventListeners();
      this.scene.start('StairsScene');
    });
  }

  /**
   * Clean up event listeners
   */
  private cleanupEventListeners(): void {
    console.log('BalconyScene: Cleaning up event listeners');
    if (this.boundOnDialogueEnded) {
      EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    }
    if (this.boundOnChoiceMade) {
      EventBus.off('choice-made', this.boundOnChoiceMade);
    }
  }

  /**
   * Cleanup when scene is shutdown (stopped)
   */
  shutdown(): void {
    this.cleanupEventListeners();
  }
}
