import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { createClickableRect, DEBUG_COLORS, enableDebugToggle, clearDebugElements } from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';
import { addItemToInventory, inventory } from '../../ui/stores';
import { get } from 'svelte/store';

/**
 * Kitchen Scene - Frozen Treasure Puzzle (Puzzle 09)
 * Player must remove 99 ice keys from the freezer to reveal the chocolates
 */
export class KitchenScene extends Phaser.Scene {
  // State flags
  private hasShownIntroDialogue: boolean = false;
  private iceKeysCollected: number = 0; // Track number of ice keys collected
  private freezerOpened: boolean = false; // Track if freezer has been opened
  private chocolatesCollected: boolean = false;
  private wineCoolerOpened: boolean = false; // Track if wine cooler has been opened
  private wineCollected: boolean = false; // Track if wine has been collected
  private noteRead: boolean = false; // Track if note on fridge has been read

  // Interactive zones
  private livingRoomZone: Phaser.GameObjects.Rectangle | null = null;
  private bathroomZone: Phaser.GameObjects.Rectangle | null = null;
  private bedroomZone: Phaser.GameObjects.Rectangle | null = null;
  private freezerZone: Phaser.GameObjects.Rectangle | null = null;
  private wineCoolerZone: Phaser.GameObjects.Rectangle | null = null;
  private noteZone: Phaser.GameObjects.Rectangle | null = null;

  // Visual elements
  private currentBackground: Phaser.GameObjects.Image | null = null;
  private noteEmoji: Phaser.GameObjects.Text | null = null;
  private livingRoomText: Phaser.GameObjects.Text | null = null;
  private bathroomText: Phaser.GameObjects.Text | null = null;
  private bedroomText: Phaser.GameObjects.Text | null = null;

  // Visual elements (chocolates sprite no longer needed - cutscene handles it)

  // Bound function references for cleanup
  private boundOnDialogueEnded!: () => void;
  private boundOnChoiceMade!: (data: { choice: string }) => void;

  constructor() {
    super({ key: 'KitchenScene' });
  }

  preload(): void {
    // Load kitchen backgrounds
    this.load.image('kitchen', '/assets/images/backgrounds/kitchen.png');
    this.load.image('kitchen_open', '/assets/images/backgrounds/kitchen_open.png');

    // Load ice key sprite (for inventory only)
    this.load.image('ice_key', '/assets/images/ui/ice_key.png');

    // TODO: Load chocolates sprite when available
  }

  create(): void {
    console.log('[KitchenScene] create() called');

    // Show inventory
    EventBus.emit('show-inventory');

    // Load saved state from sessionStorage
    this.loadState();

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
    console.log(`[KitchenScene] Camera dimensions: ${width}x${height}`);

    // Display background
    this.updateBackground();

    // Create interactive zones
    this.createInteractiveZones();

    // Enable debug tools in dev mode
    enableRectangleDrawTool(this);
    enableDebugToggle(this);

    // Show intro dialogue on first visit
    if (!this.hasShownIntroDialogue) {
      this.showIntroDialogue();
    }

    console.log('[KitchenScene] Scene setup complete');
  }

  /**
   * Load state from sessionStorage
   */
  private loadState(): void {
    const savedState = sessionStorage.getItem('kitchenSceneState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.hasShownIntroDialogue = state.hasShownIntroDialogue || false;
      this.iceKeysCollected = state.iceKeysCollected || 0;
      this.freezerOpened = state.freezerOpened || false;
      this.chocolatesCollected = state.chocolatesCollected || false;
      this.wineCoolerOpened = state.wineCoolerOpened || false;
      this.wineCollected = state.wineCollected || false;
      this.noteRead = state.noteRead || false;
      console.log('[KitchenScene] Loaded state:', state);
    } else {
      // First time in scene
      this.hasShownIntroDialogue = false;
      this.iceKeysCollected = 0;
      this.freezerOpened = false;
      this.chocolatesCollected = false;
      this.wineCoolerOpened = false;
      this.wineCollected = false;
      this.noteRead = false;
    }
  }

  /**
   * Save state to sessionStorage
   */
  private saveState(): void {
    const state = {
      hasShownIntroDialogue: this.hasShownIntroDialogue,
      iceKeysCollected: this.iceKeysCollected,
      freezerOpened: this.freezerOpened,
      chocolatesCollected: this.chocolatesCollected,
      wineCoolerOpened: this.wineCoolerOpened,
      wineCollected: this.wineCollected,
      noteRead: this.noteRead
    };
    sessionStorage.setItem('kitchenSceneState', JSON.stringify(state));
    console.log('[KitchenScene] Saved state:', state);
  }

  /**
   * Update background based on freezer state
   */
  private updateBackground(): void {
    if (!this.cameras || !this.cameras.main) {
      console.warn('[KitchenScene] Cannot update background - cameras not ready');
      return;
    }

    const { width, height } = this.cameras.main;

    // Remove old background if exists
    if (this.currentBackground) {
      this.currentBackground.destroy();
    }

    // Show appropriate background based on freezer state
    const backgroundKey = this.freezerOpened ? 'kitchen_open' : 'kitchen';
    this.currentBackground = this.add.image(width / 2, height / 2, backgroundKey);
    this.currentBackground.setDisplaySize(width, height);
    this.currentBackground.setDepth(0);

    console.log(`[KitchenScene] Background updated to: ${backgroundKey}`);
  }

  /**
   * Create all interactive zones
   */
  private createInteractiveZones(): void {
    // Clear existing zones
    this.livingRoomZone?.destroy();
    this.bathroomZone?.destroy();
    this.bedroomZone?.destroy();
    this.freezerZone?.destroy();
    this.wineCoolerZone?.destroy();
    this.noteZone?.destroy();

    // Clear existing texts
    this.livingRoomText?.destroy();
    this.bathroomText?.destroy();
    this.bedroomText?.destroy();
    this.noteEmoji?.destroy();

    // No sprites to clear - everything is handled via cutscene

    // Navigation zones
    this.createLivingRoomZone();
    this.createBathroomZone();
    this.createBedroomZone();

    // Puzzle zones
    this.createFreezerZone();
    this.createWineCoolerZone();
    this.createNoteZone();
  }

  /**
   * Create Living Room navigation zone
   */
  private createLivingRoomZone(): void {
    // Living room coordinates from RectangleDrawTool (Sala ->)
    const centerX = 1181.26;
    const centerY = 657.35;
    const width = 187.10;
    const height = 118.61;

    this.livingRoomZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.NAVIGATION,
      'Sala'
    );
    this.livingRoomZone.on('pointerdown', () => this.onLivingRoomClicked());

    this.livingRoomText = this.add.text(centerX, centerY, 'Sala →', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    this.livingRoomText.setOrigin(0.5);
    this.livingRoomText.setDepth(1000);
  }

  /**
   * Create Bathroom navigation zone
   */
  private createBathroomZone(): void {
    // Bathroom coordinates from RectangleDrawTool (<- Banheiro)
    const centerX = 93.73;
    const centerY = 660.70;
    const width = 187.10;
    const height = 118.61;

    this.bathroomZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.NAVIGATION,
      'Banheiro'
    );
    this.bathroomZone.on('pointerdown', () => this.onBathroomClicked());

    this.bathroomText = this.add.text(centerX, centerY, '← Banheiro', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    this.bathroomText.setOrigin(0.5);
    this.bathroomText.setDepth(1000);
  }

  /**
   * Create Bedroom navigation zone
   */
  private createBedroomZone(): void {
    // Bedroom coordinates from RectangleDrawTool (<- Quarto)
    const centerX = 97.07;
    const centerY = 316.57;
    const width = 187.10;
    const height = 118.61;

    this.bedroomZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.NAVIGATION,
      'Quarto'
    );
    this.bedroomZone.on('pointerdown', () => this.onBedroomClicked());

    this.bedroomText = this.add.text(centerX, centerY, '← Quarto', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    this.bedroomText.setOrigin(0.5);
    this.bedroomText.setDepth(1000);
  }

  /**
   * Create Freezer interactive zone (top-right corner)
   */
  private createFreezerZone(): void {
    // Freezer coordinates from RectangleDrawTool (top-right corner of kitchen)
    const centerX = 1151.19;
    const centerY = 227.19;
    const width = 252.25;
    const height = 145.34;

    this.freezerZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.HOTSPOT,
      'Freezer'
    );
    this.freezerZone.on('pointerdown', () => this.onFreezerClicked());

    // No visual ice keys - they're invisible in the disgusting freezer!
  }

  /**
   * Create Wine Cooler interactive zone (center-left of kitchen)
   */
  private createWineCoolerZone(): void {
    // Wine cooler coordinates from RectangleDrawTool
    const centerX = 538.10;
    const centerY = 477.77;
    const width = 192.11;
    const height = 138.65;

    this.wineCoolerZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.HOTSPOT,
      'Adega de Vinho'
    );
    this.wineCoolerZone.on('pointerdown', () => this.onWineCoolerClicked());
  }

  /**
   * Create Note interactive zone (on fridge)
   */
  private createNoteZone(): void {
    // Note coordinates from RectangleDrawTool
    const centerX = 1153.69;
    const centerY = 397.59;
    const width = 46.78;
    const height = 55.13;

    this.noteZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.HOTSPOT,
      'Bilhete'
    );
    this.noteZone.on('pointerdown', () => this.onNoteClicked());

    // Add note emoji visual
    this.noteEmoji = this.add.text(centerX, centerY, '📝', {
      fontSize: '32px'
    });
    this.noteEmoji.setOrigin(0.5);
    this.noteEmoji.setDepth(100);
  }

  /**
   * Show intro dialogue
   */
  private async showIntroDialogue(): Promise<void> {
    console.log('[KitchenScene] Showing intro dialogue');
    await DialogueManager.loadScript('kitchen', 'kitchen_intro');
    DialogueManager.startDialogue();
    this.hasShownIntroDialogue = true;
    this.saveState();
  }

  /**
   * Handle freezer clicked - new flow with cutscene
   */
  private async onFreezerClicked(): Promise<void> {
    console.log('[KitchenScene] Freezer clicked');

    // If chocolates already collected, do nothing
    if (this.chocolatesCollected) {
      return;
    }

    // First click: Open freezer and show disgust dialogue
    if (!this.freezerOpened) {
      this.freezerOpened = true;
      this.saveState();

      // Change background to show open freezer
      this.updateBackground();

      // Show first-time opening dialogue
      await DialogueManager.loadScript('kitchen', 'freezer_first_open');
      DialogueManager.startDialogue();
      return;
    }

    // Subsequent clicks: Collect keys with occasional disgust comments
    if (this.iceKeysCollected < 10) {
      this.iceKeysCollected++;
      console.log(`[KitchenScene] Ice keys collected: ${this.iceKeysCollected}/10`);

      // Add ice key to inventory
      addItemToInventory({
        id: 'ice_key',
        name: 'Chave de Gelo',
        icon: '/assets/images/ui/ice_key.png'
      }, 1);

      // Show random disgust dialogue (30% chance)
      if (Math.random() < 0.3 && this.iceKeysCollected < 10) {
        const disgustDialogues = ['disgust_1', 'disgust_2', 'disgust_3', 'disgust_4', 'disgust_5', 'disgust_6'];
        const randomDialogue = disgustDialogues[Math.floor(Math.random() * disgustDialogues.length)];
        await DialogueManager.loadScript('kitchen', randomDialogue);
        DialogueManager.startDialogue();
      }

      // Check if reached 10 keys - trigger cutscene
      if (this.iceKeysCollected >= 10) {
        this.saveState();
        await this.triggerThousandYearsCutscene();
      } else {
        this.saveState();
      }
    }
  }

  /**
   * Trigger "1000 years later" cutscene
   */
  private async triggerThousandYearsCutscene(): Promise<void> {
    console.log('[KitchenScene] Triggering 1000 years later cutscene');

    // Fade to black
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show narrator dialogue
    await DialogueManager.loadScript('kitchen', 'thousand_years_later');
    DialogueManager.startDialogue();

    // Wait for dialogue to end
    const onNarratorEnd = async () => {
      console.log('[KitchenScene] Narrator dialogue ended');

      // Add remaining ice keys (989 more) to reach 999 total
      addItemToInventory({
        id: 'ice_key',
        name: 'Chave de Gelo',
        icon: '/assets/images/ui/ice_key.png'
      }, 989);

      // Mark chocolates as collected
      this.chocolatesCollected = true;
      this.saveState();

      // Add chocolates to inventory directly (no animation needed for cutscene)
      EventBus.emit('item-acquired', {
        id: 'chocolates',
        name: 'Chocolates',
        icon: '🍫'
      });

      // Wait for item acquisition animation
      const onChocolatesAcquired = async () => {
        // Show found chocolates dialogue
        await DialogueManager.loadScript('kitchen', 'found_chocolates');
        DialogueManager.startDialogue();

        // Mark gift as collected after dialogue
        const onFoundDialogueEnd = () => {
          if (!this.scene.isActive('KitchenScene')) {
            return;
          }

          EventBus.emit('gift-collected', {
            giftId: 'gift4' // Chocolates is the 4th gift
          });
          console.log('[KitchenScene] Chocolates gift collected');
        };

        EventBus.once('dialogue-ended', onFoundDialogueEnd);
      };

      EventBus.once('item-acquisition-complete', onChocolatesAcquired);

      // Fade back in
      this.cameras.main.fadeIn(1000, 0, 0, 0);
    };

    EventBus.once('dialogue-ended', onNarratorEnd);
  }

  /**
   * Handle note clicked - non-collectible, just reads the note
   */
  private async onNoteClicked(): Promise<void> {
    console.log('[KitchenScene] Note clicked');

    // Show note dialogue
    await DialogueManager.loadScript('kitchen', 'note_on_fridge');
    DialogueManager.startDialogue();

    // Mark as read (optional - for future use)
    if (!this.noteRead) {
      this.noteRead = true;
      this.saveState();
    }
  }

  /**
   * Handle wine cooler clicked
   */
  private async onWineCoolerClicked(): Promise<void> {
    console.log('[KitchenScene] Wine cooler clicked');

    // If wine already collected, do nothing
    if (this.wineCollected) {
      return;
    }

    // If wine cooler already opened, collect wine
    if (this.wineCoolerOpened) {
      await this.collectWine();
      return;
    }

    // Check if player has ice keys
    const currentInventory = get(inventory);
    const iceKeyItem = currentInventory.find(item => item.id === 'ice_key');
    const hasIceKeys = iceKeyItem && (iceKeyItem.quantity || 0) > 0;

    if (!hasIceKeys) {
      // No ice keys - show locked dialogue
      await DialogueManager.loadScript('kitchen', 'wine_cooler_locked');
      DialogueManager.startDialogue();
      return;
    }

    // Has ice keys - open the wine cooler
    await this.openWineCooler();
  }

  /**
   * Open wine cooler using an ice key
   */
  private async openWineCooler(): Promise<void> {
    console.log('[KitchenScene] Opening wine cooler');

    // Subtract one ice key from inventory
    inventory.update(items => {
      const iceKeyIndex = items.findIndex(item => item.id === 'ice_key');
      if (iceKeyIndex !== -1) {
        const updatedItems = [...items];
        const currentQuantity = updatedItems[iceKeyIndex].quantity || 1;

        if (currentQuantity > 1) {
          // Decrease quantity
          updatedItems[iceKeyIndex] = {
            ...updatedItems[iceKeyIndex],
            quantity: currentQuantity - 1
          };
        } else {
          // Remove item if only one left
          updatedItems.splice(iceKeyIndex, 1);
        }

        return updatedItems;
      }
      return items;
    });

    // Mark as opened
    this.wineCoolerOpened = true;
    this.saveState();

    // Show opening dialogue
    await DialogueManager.loadScript('kitchen', 'wine_cooler_opened');
    DialogueManager.startDialogue();

    // After dialogue, automatically collect wine
    const onOpenDialogueEnd = async () => {
      if (!this.scene.isActive('KitchenScene')) {
        return;
      }

      await this.collectWine();
    };

    EventBus.once('dialogue-ended', onOpenDialogueEnd);
  }

  /**
   * Collect wine from opened wine cooler
   */
  private async collectWine(): Promise<void> {
    console.log('[KitchenScene] Collecting wine');

    // Mark as collected
    this.wineCollected = true;
    this.saveState();

    // Show item acquisition animation
    EventBus.emit('item-acquired', {
      id: 'wine',
      name: 'Vinho',
      icon: '🍷'
    });

    // Wait for animation
    const onWineAcquired = async () => {
      if (!this.scene.isActive('KitchenScene')) {
        return;
      }

      // Show found wine dialogue
      await DialogueManager.loadScript('kitchen', 'found_wine');
      DialogueManager.startDialogue();

      // Mark gift as collected
      const onWineDialogueEnd = () => {
        if (!this.scene.isActive('KitchenScene')) {
          return;
        }

        EventBus.emit('gift-collected', {
          giftId: 'gift2' // Wine is the 2nd gift
        });
        console.log('[KitchenScene] Wine gift collected');
      };

      EventBus.once('dialogue-ended', onWineDialogueEnd);
    };

    EventBus.once('item-acquisition-complete', onWineAcquired);
  }

  /**
   * Handle choice made (no longer used, but kept for compatibility)
   */
  private onChoiceMade(data: { choice: string }): void {
    console.log('[KitchenScene] Choice made (deprecated):', data.choice);
  }

  /**
   * Handle Living Room navigation
   */
  private onLivingRoomClicked(): void {
    console.log('[KitchenScene] Navigating to Living Room');
    this.scene.start('LivingRoomScene');
  }

  /**
   * Handle Bathroom navigation
   */
  private onBathroomClicked(): void {
    console.log('[KitchenScene] Navigating to Bathroom');
    this.scene.start('BathroomScene');
  }

  /**
   * Handle Bedroom navigation
   */
  private onBedroomClicked(): void {
    console.log('[KitchenScene] Bedroom door clicked');

    // Check if player has the bedroom key
    const hasKey = get(inventory).some((item) => item.id === 'dirty_key');

    if (!hasKey) {
      // Door is locked - show locked dialogue
      console.log('[KitchenScene] Bedroom door is locked');
      DialogueManager.loadScript('kitchen', 'bedroom_door_locked').then(() => {
        DialogueManager.startDialogue();
      });
      return;
    }

    // Has key - navigate to bedroom
    console.log('[KitchenScene] Navigating to Bedroom');
    this.scene.start('BedroomScene');
  }

  /**
   * Handle dialogue ended event
   */
  private onDialogueEnded(): void {
    console.log('[KitchenScene] Dialogue ended');

    if (!this.scene.isActive('KitchenScene')) {
      console.log('[KitchenScene] Scene not active, ignoring dialogue-ended event');
      return;
    }

    // Generic handler - specific handlers use EventBus.once
  }

  /**
   * Cleanup when scene is shutdown
   */
  shutdown(): void {
    console.log('[KitchenScene] Shutting down');

    // Remove event listeners
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.off('choice-made', this.boundOnChoiceMade);

    // Clear debug elements
    clearDebugElements();
  }
}
