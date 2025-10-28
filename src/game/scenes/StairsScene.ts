import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { inventory } from '../../ui/stores';
import type { Item } from '../../ui/stores';
import { createClickableRect, DEBUG_COLORS, enableDebugToggle, clearDebugElements } from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';

/**
 * Stairs Scene - Scene after unlocking the gate
 * Shows the stairs with doors to balcony and hallway
 */
export class StairsScene extends Phaser.Scene {
  private hasShownIntroDialogue: boolean = false;
  private hasShownLockedDoorDialogue: boolean = false;
  private doorIsOpen: boolean = false;
  private currentBackground: Phaser.GameObjects.Image | null = null;

  // Store zone references
  private balconyDoorZone: Phaser.GameObjects.Rectangle | null = null;
  private hallwayDoorZone: Phaser.GameObjects.Rectangle | null = null;

  // Store text labels
  private balconyDoorText: Phaser.GameObjects.Text | null = null;

  // Store bound function references for proper cleanup
  private boundOnDialogueEnded!: () => void;

  constructor() {
    super({ key: 'StairsScene' });
  }

  preload(): void {
    // Load stairs backgrounds
    this.load.image('stairs_closed', '/assets/images/backgrounds/stairs_door_closed.png');
    this.load.image('stairs_open', '/assets/images/backgrounds/stairs_door_open.png');
  }

  create(): void {
    console.log('StairsScene.create() called');

    // Show inventory (it's hidden during intro)
    EventBus.emit('show-inventory');

    // Load saved state from sessionStorage
    const savedState = sessionStorage.getItem('stairsSceneState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.hasShownIntroDialogue = state.hasShownIntroDialogue || false;
      this.hasShownLockedDoorDialogue = state.hasShownLockedDoorDialogue || false;
      this.doorIsOpen = state.doorIsOpen || false;
      console.log('Loaded StairsScene state:', state);
    } else {
      // First time in scene - initialize state
      this.hasShownIntroDialogue = false;
      this.hasShownLockedDoorDialogue = false;
      this.doorIsOpen = false;
    }
    this.currentBackground = null;
    this.balconyDoorZone = null;
    this.hallwayDoorZone = null;
    this.balconyDoorText = null;

    // Store bound functions for proper cleanup
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);

    // Listen for events
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);

    const { width, height } = this.cameras.main;

    // Display stairs background - use correct texture based on doorIsOpen state
    const backgroundTexture = this.doorIsOpen ? 'stairs_open' : 'stairs_closed';
    this.currentBackground = this.add.image(width / 2, height / 2, backgroundTexture);

    // Scale to fit the game view while maintaining aspect ratio
    const scaleX = width / this.currentBackground.width;
    const scaleY = height / this.currentBackground.height;
    const scale = Math.max(scaleX, scaleY);
    this.currentBackground.setScale(scale);

    console.log(`StairsScene background set to: ${backgroundTexture} (doorIsOpen: ${this.doorIsOpen})`);

    // Create interactive zones (will be enabled after intro dialogue)
    this.createInteractiveZones();

    // Enable rectangle draw tool (dev mode only)
    enableRectangleDrawTool(this);

    // Enable debug visibility toggle (dev mode only)
    enableDebugToggle(this);

    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // Start intro dialogue after fade in (only if not shown before)
    this.cameras.main.once('camerafadeincomplete', () => {
      if (!this.hasShownIntroDialogue) {
        this.startIntroDialogue();
      } else {
        // Returning to scene - show return dialogue and enable zones
        this.onReturnToStairs();
      }
    });
  }

  /**
   * Start the stairs intro dialogue
   */
  private async startIntroDialogue(): Promise<void> {
    await DialogueManager.loadScript('stairs', 'stairs_intro');
    DialogueManager.startDialogue();
    this.hasShownIntroDialogue = true;
    this.saveState();
  }

  /**
   * Handle returning to stairs from balcony
   */
  private async onReturnToStairs(): Promise<void> {
    console.log('Returned to stairs scene');

    // If already showed locked door dialogue, enable balcony door immediately
    if (this.hasShownLockedDoorDialogue) {
      if (this.balconyDoorZone) {
        this.balconyDoorZone.setInteractive({ useHandCursor: true });
      }
      if (this.balconyDoorText) {
        this.balconyDoorText.setVisible(true);
      }
    }

    // Always enable hallway door
    if (this.hallwayDoorZone) {
      this.hallwayDoorZone.setInteractive({ useHandCursor: true });
    }

    // Optional: Show a brief return dialogue
    // await DialogueManager.loadScript('stairs', 'return_from_balcony');
    // DialogueManager.startDialogue();
  }

  /**
   * Save scene state to sessionStorage
   */
  private saveState(): void {
    const state = {
      hasShownIntroDialogue: this.hasShownIntroDialogue,
      hasShownLockedDoorDialogue: this.hasShownLockedDoorDialogue,
      doorIsOpen: this.doorIsOpen,
    };
    sessionStorage.setItem('stairsSceneState', JSON.stringify(state));
    console.log('Saved StairsScene state:', state);
  }

  /**
   * Handle dialogue end event
   */
  private onDialogueEnded(): void {
    console.log('StairsScene.onDialogueEnded');

    // Enable interaction zones after intro dialogue
    if (this.hasShownIntroDialogue && !this.hasShownLockedDoorDialogue) {
      // First time: enable zones but DON'T show balcony text yet
      if (this.hallwayDoorZone) {
        this.hallwayDoorZone.setInteractive({ useHandCursor: true });
      }
    }

    // After showing locked door dialogue, enable balcony door
    if (this.hasShownLockedDoorDialogue) {
      if (this.balconyDoorZone) {
        this.balconyDoorZone.setInteractive({ useHandCursor: true });
      }

      // Show balcony door text
      if (this.balconyDoorText) {
        this.balconyDoorText.setVisible(true);
      }
    }
  }

  /**
   * Create interactive zones for doors
   * Coordinates will be provided after using RectangleDrawTool
   */
  private createInteractiveZones(): void {
    // Balcony Door Zone
    this.balconyDoorZone = createClickableRect(
      this,
      1051.79, // centerX
      77.68,   // centerY
      456.06,  // width
      148.68,  // height
      undefined, // Use default (controlled by DEV_MODE)
      DEBUG_COLORS.NAVIGATION,
      'Balcony Door'
    );
    this.balconyDoorZone.disableInteractive();
    this.balconyDoorZone.on('pointerdown', () => this.onBalconyDoorClicked());

    // Create text label for balcony door (hidden initially)
    this.balconyDoorText = this.add.text(
      1051.79,
      77.68,
      'Ir para a sacada',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 16, y: 8 },
        stroke: '#ff6600',
        strokeThickness: 2,
      }
    );
    this.balconyDoorText.setOrigin(0.5, 0.5);
    this.balconyDoorText.setVisible(false); // Hidden until dialogue ends
    this.balconyDoorText.setDepth(1000); // Above everything

    // Hallway Door Zone
    this.hallwayDoorZone = createClickableRect(
      this,
      724.36, // centerX
      121.11, // centerY
      145.34, // width
      235.55, // height
      undefined, // Use default (controlled by DEV_MODE)
      DEBUG_COLORS.CLICKABLE,
      'Hallway Door'
    );
    this.hallwayDoorZone.disableInteractive();
    this.hallwayDoorZone.on('pointerdown', () => this.onHallwayDoorClicked());
  }

  /**
   * Handle balcony door click - transition to BalconyScene
   */
  private onBalconyDoorClicked(): void {
    console.log('Balcony door clicked, transitioning to BalconyScene');

    // Fade out
    this.cameras.main.fadeOut(500, 0, 0, 0);

    // Transition to BalconyScene when fade completes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.cleanupEventListeners();
      this.scene.start('BalconyScene');
    });
  }

  /**
   * Handle hallway door click
   * Check if door is already open, otherwise check for key
   */
  private async onHallwayDoorClicked(): Promise<void> {
    console.log('Hallway door clicked, doorIsOpen:', this.doorIsOpen);

    // If door is already open, go straight to HallwayScene
    if (this.doorIsOpen) {
      console.log('Door is already open, transitioning to HallwayScene');
      this.goToHallway();
      return;
    }

    // Check if player has the Hallway Key
    let hasKey = false;
    inventory.subscribe(items => {
      hasKey = items.some(item => item.id === 'hallway_key');
    })();

    if (!hasKey) {
      // Show locked door dialogue
      this.hasShownLockedDoorDialogue = true;
      this.saveState();
      await DialogueManager.loadScript('stairs', 'hallway_door_locked');
      DialogueManager.startDialogue();
    } else {
      // Use the key and open the door
      this.useHallwayKey();
    }
  }

  /**
   * Use the Hallway Key to open the door
   */
  private useHallwayKey(): void {
    console.log('Using Hallway Key to open door');

    // Remove key from inventory
    inventory.update(items => items.filter(item => item.id !== 'hallway_key'));

    // Switch background to open door
    if (this.currentBackground) {
      this.currentBackground.setTexture('stairs_open');
    }
    this.doorIsOpen = true;
    this.saveState();

    // Transition to HallwayScene
    this.goToHallway();
  }

  /**
   * Transition to HallwayScene
   */
  private goToHallway(): void {
    console.log('Transitioning to HallwayScene');

    // Fade out
    this.cameras.main.fadeOut(500, 0, 0, 0);

    // Transition to HallwayScene when fade completes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.cleanupEventListeners();
      this.scene.start('HallwayScene');
    });
  }

  /**
   * Clean up event listeners
   */
  private cleanupEventListeners(): void {
    console.log('StairsScene: Cleaning up event listeners');
    if (this.boundOnDialogueEnded) {
      EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    }
  }

  /**
   * Cleanup when scene is shutdown (stopped)
   */
  shutdown(): void {
    this.cleanupEventListeners();
    clearDebugElements();
  }
}
