import Phaser from 'phaser';
import { get } from 'svelte/store';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { selectedItem, inventory } from '../../ui/stores';
import {
  createClickableRect,
  DEBUG_COLORS,
  enableDebugToggle,
  clearDebugElements,
} from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';

/**
 * Bathroom Scene - Cheese Safe Puzzle
 * Player must open the safe using symbols from Ric's diary to get the cheese
 */
export class BathroomScene extends Phaser.Scene {
  // State flags
  private hasShownIntroDialogue: boolean = false;
  private safeOpened: boolean = false;
  private cheeseCollected: boolean = false;
  private dirtyKeyFound: boolean = false;

  // Interactive zones
  private kitchenZone: Phaser.GameObjects.Rectangle | null = null;
  private bedroomZone: Phaser.GameObjects.Rectangle | null = null;
  private safeZone: Phaser.GameObjects.Rectangle | null = null;
  private cheeseZone: Phaser.GameObjects.Rectangle | null = null;
  private litterBoxZone: Phaser.GameObjects.Rectangle | null = null;
  private toiletZone: Phaser.GameObjects.Rectangle | null = null;

  // Visual elements
  private currentBackground: Phaser.GameObjects.Image | null = null;
  private kitchenText: Phaser.GameObjects.Text | null = null;
  private bedroomText: Phaser.GameObjects.Text | null = null;
  private cheeseIcon: Phaser.GameObjects.Image | null = null;

  // Bound function references for cleanup
  private boundOnDialogueEnded!: () => void;
  private boundOnSafeUnlocked!: () => void;

  constructor() {
    super({ key: 'BathroomScene' });
  }

  preload(): void {
    // Load bathroom background
    this.load.image('bathroom', '/assets/images/backgrounds/bathroom.png');

    // Load cheese sprite
    this.load.image('cheese', '/assets/images/ui/cheese.png');
  }

  create(): void {
    console.log('[BathroomScene] create() called');

    // Show inventory
    EventBus.emit('show-inventory');

    // Load saved state from sessionStorage
    this.loadState();

    // Store bound functions for proper cleanup
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);
    this.boundOnSafeUnlocked = this.onSafeUnlocked.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.off('safe-unlocked', this.boundOnSafeUnlocked);

    // Listen for events
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.on('safe-unlocked', this.boundOnSafeUnlocked);

    const { width, height } = this.cameras.main;
    console.log(`[BathroomScene] Camera dimensions: ${width}x${height}`);

    // Display background
    this.currentBackground = this.add.image(width / 2, height / 2, 'bathroom');
    this.currentBackground.setDisplaySize(width, height);
    this.currentBackground.setDepth(0);

    // Create interactive zones
    this.createInteractiveZones();

    // Enable debug tools in dev mode
    enableRectangleDrawTool(this);
    enableDebugToggle(this);

    // Show intro dialogue on first visit
    if (!this.hasShownIntroDialogue) {
      this.showIntroDialogue();
    }

    console.log('[BathroomScene] Scene setup complete');
  }

  /**
   * Load state from sessionStorage
   */
  private loadState(): void {
    const savedState = sessionStorage.getItem('bathroomSceneState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.hasShownIntroDialogue = state.hasShownIntroDialogue || false;
      this.safeOpened = state.safeOpened || false;
      this.cheeseCollected = state.cheeseCollected || false;
      this.dirtyKeyFound = state.dirtyKeyFound || false;
      console.log('[BathroomScene] Loaded state:', state);
    } else {
      // First time in scene
      this.hasShownIntroDialogue = false;
      this.safeOpened = false;
      this.cheeseCollected = false;
      this.dirtyKeyFound = false;
    }
  }

  /**
   * Save state to sessionStorage
   */
  private saveState(): void {
    const state = {
      hasShownIntroDialogue: this.hasShownIntroDialogue,
      safeOpened: this.safeOpened,
      cheeseCollected: this.cheeseCollected,
      dirtyKeyFound: this.dirtyKeyFound,
    };
    sessionStorage.setItem('bathroomSceneState', JSON.stringify(state));
    console.log('[BathroomScene] Saved state:', state);
  }

  /**
   * Create all interactive zones
   */
  private createInteractiveZones(): void {
    // Clear existing zones
    this.kitchenZone?.destroy();
    this.bedroomZone?.destroy();
    this.safeZone?.destroy();
    this.cheeseZone?.destroy();
    this.litterBoxZone?.destroy();
    this.toiletZone?.destroy();

    // Clear existing texts
    this.kitchenText?.destroy();
    this.bedroomText?.destroy();
    this.cheeseIcon?.destroy();

    // Navigation zones
    this.createKitchenZone();
    this.createBedroomZone();

    // Puzzle zones
    this.createSafeZone();
    this.createLitterBoxZone();
    this.createToiletZone();

    // Cheese zone (only if safe is opened)
    if (this.safeOpened && !this.cheeseCollected) {
      this.createCheeseZone();
    }
  }

  /**
   * Create Kitchen navigation zone
   */
  private createKitchenZone(): void {
    // TODO: Adjust coordinates based on actual bathroom background
    const centerX = 1200;
    const centerY = 650;
    const width = 150;
    const height = 100;

    this.kitchenZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.NAVIGATION,
      'Cozinha'
    );
    this.kitchenZone.on('pointerdown', () => this.onKitchenClicked());

    this.kitchenText = this.add.text(centerX, centerY, 'Cozinha →', {
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
        fill: true,
      },
    });
    this.kitchenText.setOrigin(0.5);
    this.kitchenText.setDepth(1000);
  }

  /**
   * Create Bedroom navigation zone
   */
  private createBedroomZone(): void {
    // TODO: Adjust coordinates based on actual bathroom background
    const centerX = 100;
    const centerY = 300;
    const width = 150;
    const height = 100;

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
        fill: true,
      },
    });
    this.bedroomText.setOrigin(0.5);
    this.bedroomText.setDepth(1000);
  }

  /**
   * Create Safe interactive zone
   */
  private createSafeZone(): void {
    // Safe coordinates from RectangleDrawTool
    const centerX = 523.9;
    const centerY = 484.45;
    const width = 128.63;
    const height = 130.3;

    this.safeZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.HOTSPOT,
      'Cofre'
    );
    this.safeZone.on('pointerdown', () => this.onSafeClicked());
  }

  /**
   * Create Litter Box interactive zone
   */
  private createLitterBoxZone(): void {
    // Litter box coordinates from RectangleDrawTool
    const centerX = 685.94;
    const centerY = 346.64;
    const width = 188.77;
    const height = 88.54;

    this.litterBoxZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.HOTSPOT,
      'Caixa de Areia'
    );
    this.litterBoxZone.on('pointerdown', () => this.onLitterBoxClicked());
  }

  /**
   * Create Toilet interactive zone
   */
  private createToiletZone(): void {
    // Toilet coordinates from RectangleDrawTool
    const centerX = 809.56;
    const centerY = 502.0;
    const width = 232.21;
    const height = 172.06;

    this.toiletZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.HOTSPOT,
      'Privada'
    );
    this.toiletZone.on('pointerdown', () => this.onToiletClicked());
  }

  /**
   * Create Cheese zone (after safe is opened)
   */
  private createCheeseZone(): void {
    // Cheese appears inside the opened safe (same position as safe)
    const centerX = 523.9;
    const centerY = 484.45;
    const width = 80;
    const height = 80;

    // Show cheese sprite
    this.cheeseIcon = this.add.image(centerX, centerY, 'cheese');
    this.cheeseIcon.setOrigin(0.5);
    this.cheeseIcon.setDepth(100);
    this.cheeseIcon.setScale(0.1); // Adjust scale to fit nicely in the safe

    this.cheeseZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.ITEM,
      'Queijo'
    );
    this.cheeseZone.on('pointerdown', () => this.onCheeseClicked());
  }

  /**
   * Show intro dialogue
   */
  private async showIntroDialogue(): Promise<void> {
    console.log('[BathroomScene] Showing intro dialogue');
    await DialogueManager.loadScript('bathroom', 'bathroom_intro');
    DialogueManager.startDialogue();
    this.hasShownIntroDialogue = true;
    this.saveState();
  }

  /**
   * Handle safe clicked
   */
  private async onSafeClicked(): Promise<void> {
    console.log('[BathroomScene] Safe clicked');

    // If already opened, show cheese or do nothing
    if (this.safeOpened) {
      return;
    }

    // Show found_safe dialogue
    await DialogueManager.loadScript('bathroom', 'found_safe');
    DialogueManager.startDialogue();

    // After dialogue, open the safe UI
    EventBus.once('dialogue-ended', () => {
      if (!this.scene.isActive('BathroomScene')) {
        return;
      }

      // Open safe puzzle UI
      EventBus.emit('show-safe');
    });
  }

  /**
   * Handle safe unlocked event from Safe.svelte
   */
  private onSafeUnlocked(): void {
    console.log('[BathroomScene] Safe unlocked!');
    this.safeOpened = true;
    this.saveState();

    // Show cheese
    this.createCheeseZone();
  }

  /**
   * Handle cheese clicked
   */
  private async onCheeseClicked(): Promise<void> {
    console.log('[BathroomScene] Cheese clicked');

    if (this.cheeseCollected) {
      return;
    }

    this.cheeseCollected = true;
    this.saveState();

    // Hide cheese icon and zone
    if (this.cheeseIcon) {
      this.cheeseIcon.setVisible(false);
    }
    if (this.cheeseZone) {
      this.cheeseZone.disableInteractive();
    }

    // Show dialogue
    await DialogueManager.loadScript('bathroom', 'found_cheese');
    DialogueManager.startDialogue();

    // Trigger item acquisition animation after dialogue ends
    EventBus.once('dialogue-ended', () => {
      EventBus.emit('item-acquired', {
        id: 'cheese',
        name: 'Queijo',
        icon: '/assets/images/ui/cheese.png',
      });

      // Mark as gift
      EventBus.emit('gift-collected', 'gift3');
    });
  }

  /**
   * Handle Kitchen navigation
   */
  private onKitchenClicked(): void {
    console.log('[BathroomScene] Navigating to Kitchen');
    this.scene.start('KitchenScene');
  }

  /**
   * Handle Bedroom navigation
   */
  private onBedroomClicked(): void {
    console.log('[BathroomScene] Bedroom door clicked');

    // Check if player has the bedroom key
    const hasKey = get(inventory).some((item) => item.id === 'dirty_key');

    if (!hasKey) {
      // Door is locked - show locked dialogue
      console.log('[BathroomScene] Bedroom door is locked');
      DialogueManager.loadScript('bathroom', 'bedroom_door_locked').then(() => {
        DialogueManager.startDialogue();
      });
      return;
    }

    // Has key - navigate to bedroom
    console.log('[BathroomScene] Navigating to Bedroom');
    this.scene.start('BedroomScene');
  }

  /**
   * Handle litter box clicked - requires miniature_rake to find dirty key
   */
  private async onLitterBoxClicked(): Promise<void> {
    console.log(
      '[BathroomScene] Litter box clicked, dirtyKeyFound:',
      this.dirtyKeyFound
    );

    const selected = get(selectedItem);

    // If key already found, show empty message
    if (this.dirtyKeyFound) {
      await DialogueManager.loadScript('bathroom', 'litter_box_empty');
      DialogueManager.startDialogue();
      return;
    }

    // If no item selected, show hint about needing a tool
    if (!selected) {
      await DialogueManager.loadScript('bathroom', 'litter_box_no_rake');
      DialogueManager.startDialogue();
      return;
    }

    // Using miniature_rake on litter box
    if (selected.id === 'miniature_rake') {
      console.log('[BathroomScene] Using miniature_rake on litter box');
      this.dirtyKeyFound = true;
      this.saveState();

      // Clear selection
      selectedItem.set(null);

      // Show dialogue about finding the key
      await DialogueManager.loadScript('bathroom', 'found_dirty_key');
      DialogueManager.startDialogue();

      // After dialogue ends, trigger item acquisition animation
      EventBus.once('dialogue-ended', () => {
        EventBus.emit('item-acquired', {
          id: 'dirty_key',
          name: 'Chave do Quarto',
          icon: '🔑',
        });
      });
    } else {
      // Wrong item selected
      console.log(
        '[BathroomScene] Wrong item used on litter box:',
        selected.id
      );

      // Show inline feedback
      EventBus.emit('show-dialogue', {
        character: 'jessica',
        text: `Não acho que ${selected.name} vai ajudar aqui...`,
      });

      // Clear selection
      selectedItem.set(null);
    }
  }

  /**
   * Handle toilet clicked - just humor, nothing useful
   */
  private async onToiletClicked(): Promise<void> {
    console.log('[BathroomScene] Toilet clicked');

    // Show funny dialogue about the toilet
    await DialogueManager.loadScript('bathroom', 'toilet_interaction');
    DialogueManager.startDialogue();
  }

  /**
   * Handle dialogue ended event
   */
  private onDialogueEnded(): void {
    // Re-enable zones after dialogue
    // This is handled automatically by dialogue manager
  }

  /**
   * Cleanup when scene shuts down
   */
  shutdown(): void {
    console.log('[BathroomScene] shutdown() called');

    // Remove event listeners
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.off('safe-unlocked', this.boundOnSafeUnlocked);

    // Clear debug elements
    clearDebugElements();
  }
}
