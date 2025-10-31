import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import {
  createClickableRect,
  DEBUG_COLORS,
  enableDebugToggle,
  clearDebugElements,
} from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';

/**
 * Bedroom Scene - Hand Gesture Enigma (Puzzle 08)
 * Player must find the old note and use hand gestures to unlock the wardrobe and get the Clothes
 */
export class BedroomScene extends Phaser.Scene {
  // State flags
  private hasShownIntroDialogue: boolean = false;
  private wardrobeUnlocked: boolean = false;
  private clothesCollected: boolean = false;
  private oldNoteCollected: boolean = false;

  // Interactive zones
  private kitchenZone: Phaser.GameObjects.Rectangle | null = null;
  private bathroomZone: Phaser.GameObjects.Rectangle | null = null;
  private wardrobeZone: Phaser.GameObjects.Rectangle | null = null;
  private clothesZone: Phaser.GameObjects.Rectangle | null = null;
  private oldNoteZone: Phaser.GameObjects.Rectangle | null = null;

  // Visual elements
  private currentBackground: Phaser.GameObjects.Image | null = null;
  private kitchenText: Phaser.GameObjects.Text | null = null;
  private bathroomText: Phaser.GameObjects.Text | null = null;
  private clothesIcon: Phaser.GameObjects.Image | null = null;
  private oldNoteSprite: Phaser.GameObjects.Image | null = null;

  // Bound function references for cleanup
  private boundOnDialogueEnded!: () => void;
  private boundOnWardrobeUnlocked!: () => void;

  constructor() {
    super({ key: 'BedroomScene' });
  }

  preload(): void {
    // Load bedroom background
    this.load.image('bedroom', '/assets/images/backgrounds/bedroom.png');

    // Load clothes sprite
    this.load.image('clothes', '/assets/images/ui/clothes.png');

    // Load old note sprite
    this.load.image('old_note', '/assets/images/ui/old_note.png');
  }

  create(): void {
    console.log('[BedroomScene] create() called');

    // Show inventory
    EventBus.emit('show-inventory');

    // Load saved state from sessionStorage
    this.loadState();

    // Store bound functions for proper cleanup
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);
    this.boundOnWardrobeUnlocked = this.onWardrobeUnlocked.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.off('wardrobe-unlocked', this.boundOnWardrobeUnlocked);

    // Listen for events
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.on('wardrobe-unlocked', this.boundOnWardrobeUnlocked);

    const { width, height } = this.cameras.main;
    console.log(`[BedroomScene] Camera dimensions: ${width}x${height}`);

    // Display background
    this.currentBackground = this.add.image(width / 2, height / 2, 'bedroom');
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

    console.log('[BedroomScene] Scene setup complete');
  }

  /**
   * Load state from sessionStorage
   */
  private loadState(): void {
    const savedState = sessionStorage.getItem('bedroomSceneState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.hasShownIntroDialogue = state.hasShownIntroDialogue || false;
      this.wardrobeUnlocked = state.wardrobeUnlocked || false;
      this.clothesCollected = state.clothesCollected || false;
      this.oldNoteCollected = state.oldNoteCollected || false;
      console.log('[BedroomScene] Loaded state:', state);
    } else {
      // First time in scene
      this.hasShownIntroDialogue = false;
      this.wardrobeUnlocked = false;
      this.clothesCollected = false;
      this.oldNoteCollected = false;
    }
  }

  /**
   * Save state to sessionStorage
   */
  private saveState(): void {
    const state = {
      hasShownIntroDialogue: this.hasShownIntroDialogue,
      wardrobeUnlocked: this.wardrobeUnlocked,
      clothesCollected: this.clothesCollected,
      oldNoteCollected: this.oldNoteCollected,
    };
    sessionStorage.setItem('bedroomSceneState', JSON.stringify(state));
    console.log('[BedroomScene] Saved state:', state);
  }

  /**
   * Create all interactive zones
   */
  private createInteractiveZones(): void {
    // Clear existing zones
    this.kitchenZone?.destroy();
    this.bathroomZone?.destroy();
    this.wardrobeZone?.destroy();
    this.clothesZone?.destroy();
    this.oldNoteZone?.destroy();

    // Clear existing texts and sprites
    this.kitchenText?.destroy();
    this.bathroomText?.destroy();
    this.oldNoteSprite?.destroy();

    // Navigation zones
    this.createKitchenZone();
    this.createBathroomZone();

    // Puzzle zones
    this.createWardrobeZone();

    // Old note zone (only if not collected)
    if (!this.oldNoteCollected) {
      this.createOldNoteZone();
    }

    // Clothes zone (only if wardrobe is unlocked and clothes not collected)
    if (this.wardrobeUnlocked && !this.clothesCollected) {
      this.createClothesZone();
    }
  }

  /**
   * Create Kitchen navigation zone
   */
  private createKitchenZone(): void {
    // TODO: Adjust coordinates based on actual bedroom background
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
   * Create Bathroom navigation zone
   */
  private createBathroomZone(): void {
    // TODO: Adjust coordinates based on actual bedroom background
    const centerX = 100;
    const centerY = 300;
    const width = 150;
    const height = 100;

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
        fill: true,
      },
    });
    this.bathroomText.setOrigin(0.5);
    this.bathroomText.setDepth(1000);
  }

  /**
   * Create Wardrobe interactive zone
   */
  private createWardrobeZone(): void {
    // Wardrobe coordinates from RectangleDrawTool
    const centerX = 885.57;
    const centerY = 325.75;
    const width = 210.49;
    const height = 544.59;

    this.wardrobeZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.HOTSPOT,
      'Guarda-roupa'
    );
    this.wardrobeZone.on('pointerdown', () => this.onWardrobeClicked());
  }

  /**
   * Create Old Note zone
   */
  private createOldNoteZone(): void {
    // TODO: Adjust coordinates based on actual bedroom background
    const centerX = 400;
    const centerY = 500;
    const width = 80;
    const height = 80;

    // Show note sprite
    this.oldNoteSprite = this.add.image(centerX, centerY, 'old_note');
    this.oldNoteSprite.setOrigin(0.5);
    this.oldNoteSprite.setDepth(100);
    this.oldNoteSprite.setScale(0.08); // Adjust scale to fit nicely

    this.oldNoteZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.ITEM,
      'Bilhete Antigo'
    );
    this.oldNoteZone.on('pointerdown', () => this.onOldNoteClicked());
  }

  /**
   * Create Clothes zone (after wardrobe is unlocked)
   */
  private createClothesZone(): void {
    // Clothes appear inside the opened wardrobe (same position as wardrobe)
    const centerX = 885.57;
    const centerY = 325.75;
    const width = 100;
    const height = 100;

    // Show clothes sprite
    this.clothesIcon = this.add.image(centerX, centerY, 'clothes');
    this.clothesIcon.setOrigin(0.5);
    this.clothesIcon.setDepth(100);
    this.clothesIcon.setScale(0.15); // Adjust scale to fit nicely in the wardrobe

    this.clothesZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.ITEM,
      'Roupas'
    );
    this.clothesZone.on('pointerdown', () => this.onClothesClicked());
  }

  /**
   * Show intro dialogue
   */
  private async showIntroDialogue(): Promise<void> {
    console.log('[BedroomScene] Showing intro dialogue');
    await DialogueManager.loadScript('bedroom', 'bedroom_intro');
    DialogueManager.startDialogue();
    this.hasShownIntroDialogue = true;
    this.saveState();
  }

  /**
   * Handle wardrobe clicked
   */
  private async onWardrobeClicked(): Promise<void> {
    console.log('[BedroomScene] Wardrobe clicked');

    // If already unlocked, do nothing (clothes zone handles interaction)
    if (this.wardrobeUnlocked) {
      return;
    }

    // Show wardrobe_locked dialogue
    await DialogueManager.loadScript('bedroom', 'wardrobe_locked');
    DialogueManager.startDialogue();

    // After dialogue, open the hand gesture puzzle UI
    EventBus.once('dialogue-ended', () => {
      if (!this.scene.isActive('BedroomScene')) {
        return;
      }

      // Open hand gesture puzzle UI
      EventBus.emit('show-hand-gesture-puzzle');
    });
  }

  /**
   * Handle wardrobe unlocked event from HandGesturePuzzle.svelte
   */
  private onWardrobeUnlocked(): void {
    console.log('[BedroomScene] Wardrobe unlocked!');
    this.wardrobeUnlocked = true;
    this.saveState();

    // Show wardrobe_unlocked dialogue
    DialogueManager.loadScript('bedroom', 'wardrobe_unlocked').then(() => {
      DialogueManager.startDialogue();
    });

    // After dialogue, show clothes
    EventBus.once('dialogue-ended', () => {
      this.createClothesZone();
    });
  }

  /**
   * Handle old note clicked
   */
  private async onOldNoteClicked(): Promise<void> {
    console.log('[BedroomScene] Old note clicked');

    if (this.oldNoteCollected) {
      return;
    }

    this.oldNoteCollected = true;
    this.saveState();

    // Hide note sprite and zone
    if (this.oldNoteSprite) {
      this.oldNoteSprite.setVisible(false);
    }
    if (this.oldNoteZone) {
      this.oldNoteZone.disableInteractive();
    }

    // Show dialogue
    await DialogueManager.loadScript('bedroom', 'found_old_note');
    DialogueManager.startDialogue();

    // Trigger item acquisition animation after dialogue ends
    EventBus.once('dialogue-ended', () => {
      EventBus.emit('item-acquired', {
        id: 'old_note',
        name: 'Bilhete Antigo',
        icon: '/assets/images/ui/old_note.png',
      });
    });
  }

  /**
   * Handle clothes clicked
   */
  private async onClothesClicked(): Promise<void> {
    console.log('[BedroomScene] Clothes clicked');

    if (this.clothesCollected) {
      return;
    }

    this.clothesCollected = true;
    this.saveState();

    // Hide clothes icon and zone
    if (this.clothesIcon) {
      this.clothesIcon.setVisible(false);
    }
    if (this.clothesZone) {
      this.clothesZone.disableInteractive();
    }

    // Show dialogue
    await DialogueManager.loadScript('bedroom', 'found_clothes');
    DialogueManager.startDialogue();

    // Trigger item acquisition animation after dialogue ends
    EventBus.once('dialogue-ended', () => {
      EventBus.emit('item-acquired', {
        id: 'clothes',
        name: 'Roupas',
        icon: '/assets/images/ui/clothes.png',
      });

      // Mark as gift
      EventBus.emit('gift-collected', 'gift2');
    });
  }

  /**
   * Handle Kitchen navigation
   */
  private onKitchenClicked(): void {
    console.log('[BedroomScene] Navigating to Kitchen');
    this.scene.start('KitchenScene');
  }

  /**
   * Handle Bathroom navigation
   */
  private onBathroomClicked(): void {
    console.log('[BedroomScene] Navigating to Bathroom');
    this.scene.start('BathroomScene');
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
    console.log('[BedroomScene] shutdown() called');

    // Remove event listeners
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.off('wardrobe-unlocked', this.boundOnWardrobeUnlocked);

    // Clear debug elements
    clearDebugElements();
  }
}
