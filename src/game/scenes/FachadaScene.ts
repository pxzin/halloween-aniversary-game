import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { createInteractiveRect, DEBUG_COLORS } from '../utils/DebugHelpers';

/**
 * Fachada Scene - First interactive scene showing the house facade
 * Player must click on the gate to trigger the padlock puzzle
 */
export class FachadaScene extends Phaser.Scene {
  private hasShownIntroDialogue: boolean = false;
  private waitingForPadlockDialogue: boolean = false;

  // Store bound function references for proper cleanup
  private boundOnGateUnlocked!: () => void;
  private boundOnDialogueEnded!: () => void;

  constructor() {
    super({ key: 'FachadaScene' });
  }

  preload(): void {
    // Load facade background
    this.load.image('facade', '/assets/images/backgrounds/facade_perfect.png');
  }

  create(): void {
    console.log('FachadaScene.create() called');

    // IMPORTANT: Reset state when scene is created (Phaser reuses scene instances)
    this.hasShownIntroDialogue = false;
    this.waitingForPadlockDialogue = false;

    // Store bound functions for proper cleanup (do this BEFORE registering listeners)
    this.boundOnGateUnlocked = this.onGateUnlocked.bind(this);
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('gate-unlocked', this.boundOnGateUnlocked);
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);

    // Listen for events
    EventBus.on('gate-unlocked', this.boundOnGateUnlocked);
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);

    const { width, height } = this.cameras.main;

    // DEV: Log all pointer events in the scene
    if (import.meta.env.DEV) {
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        console.log(`[FachadaScene] Click at: x=${pointer.x}, y=${pointer.y}`);
      });

      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        // Log cursor changes
        if (this.input.manager.canvas.style.cursor !== this.input.manager.defaultCursor) {
          console.log(`[FachadaScene] Cursor changed to pointer at: x=${pointer.x}, y=${pointer.y}`);
        }
      });
    }

    // Display facade background - centered and scaled to fit
    const facade = this.add.image(width / 2, height / 2, 'facade');

    // Scale to fit the game view while maintaining aspect ratio
    const scaleX = width / facade.width;
    const scaleY = height / facade.height;
    const scale = Math.max(scaleX, scaleY);
    facade.setScale(scale);

    // Create clickable gate zone
    this.createGateZone();

    // Start intro dialogue
    this.startIntroDialogue();
  }

  /**
   * Start the facade intro dialogue
   */
  private async startIntroDialogue(): Promise<void> {
    await DialogueManager.loadScript('facade', 'facade_intro');
    DialogueManager.startDialogue();
    this.hasShownIntroDialogue = true;
  }

  /**
   * Handle dialogue end event
   */
  private onDialogueEnded(): void {
    console.log('FachadaScene.onDialogueEnded - waitingForPadlockDialogue:', this.waitingForPadlockDialogue);

    // If we just showed the padlock focus dialogue, now show the padlock
    if (this.waitingForPadlockDialogue) {
      this.waitingForPadlockDialogue = false;
      console.log('Padlock dialogue ended, showing padlock UI');
      EventBus.emit('show-padlock');
    } else {
      // Regular dialogue ended, player can now interact with the scene
      console.log('Facade intro dialogue ended, player can interact');
    }
  }

  /**
   * Create an interactive zone over the gate area
   */
  private createGateZone(): void {
    const { width, height } = this.cameras.main;

    // Create a zone covering the gate area (approximately center-bottom of the image)
    // These values may need adjustment based on the actual facade image
    const gateX = width / 2;
    const gateY = height * 0.7; // Gate is roughly 70% down from the top
    const gateWidth = width * 0.3; // Gate width is about 30% of screen width
    const gateHeight = height * 0.4; // Gate height is about 40% of screen height

    // Create interactive zone with debug visualization
    // The debug rect will automatically show in dev mode and be hidden in production
    const gateZone = createInteractiveRect(
      this,
      gateX,
      gateY,
      gateWidth,
      gateHeight,
      DEBUG_COLORS.CLICKABLE,
      'Gate Zone'
    );

    // When clicked, show padlock focus dialogue then open padlock
    gateZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log(`[FachadaScene] Gate zone clicked at: x=${pointer.x}, y=${pointer.y}`);
      console.log(`[FachadaScene] Gate zone bounds: x=${gateX}, y=${gateY}, width=${gateWidth}, height=${gateHeight}`);
      this.onGateClicked();
    });

    // DEV: Log the gate zone configuration
    if (import.meta.env.DEV) {
      console.log('[FachadaScene] Gate zone created:', {
        x: gateX,
        y: gateY,
        width: gateWidth,
        height: gateHeight,
        left: gateX - gateWidth / 2,
        right: gateX + gateWidth / 2,
        top: gateY - gateHeight / 2,
        bottom: gateY + gateHeight / 2,
      });

      // List all interactive objects in the scene
      this.time.delayedCall(100, () => {
        console.log('[FachadaScene] === All Interactive Objects ===');

        // Get all game objects in the scene
        const allObjects = this.children.list;
        const interactiveObjects = allObjects.filter((obj: any) => obj.input);

        console.log(`[FachadaScene] Total interactive objects: ${interactiveObjects.length}`);
        console.log(`[FachadaScene] Total objects in scene: ${allObjects.length}`);

        interactiveObjects.forEach((gameObject: any, index: number) => {
          if (gameObject instanceof Phaser.GameObjects.Zone) {
            console.log(`[FachadaScene] Zone ${index}:`, {
              x: gameObject.x,
              y: gameObject.y,
              width: gameObject.width,
              height: gameObject.height,
              displayWidth: gameObject.displayWidth,
              displayHeight: gameObject.displayHeight,
              scaleX: gameObject.scaleX,
              scaleY: gameObject.scaleY,
              active: gameObject.active,
              visible: gameObject.visible,
            });
          } else {
            console.log(`[FachadaScene] Object ${index}:`, gameObject.type, {
              x: gameObject.x,
              y: gameObject.y,
              width: gameObject.width,
              height: gameObject.height,
            });
          }
        });
        console.log('[FachadaScene] === End Interactive Objects ===');

        // Log camera and canvas info
        console.log('[FachadaScene] Camera info:', {
          width: this.cameras.main.width,
          height: this.cameras.main.height,
          zoom: this.cameras.main.zoom,
          scrollX: this.cameras.main.scrollX,
          scrollY: this.cameras.main.scrollY,
        });

        console.log('[FachadaScene] Canvas info:', {
          width: this.game.canvas.width,
          height: this.game.canvas.height,
          style: {
            width: this.game.canvas.style.width,
            height: this.game.canvas.style.height,
          },
        });
      });
    }
  }

  /**
   * Handle gate click - show dialogue then padlock
   */
  private async onGateClicked(): Promise<void> {
    console.log('Gate clicked, showing padlock focus dialogue');

    // Set flag so we know to show padlock when dialogue ends
    this.waitingForPadlockDialogue = true;

    // Show padlock focus dialogue
    await DialogueManager.loadScript('facade', 'padlock_focus');
    DialogueManager.startDialogue();
  }

  /**
   * Handle gate unlock event - transition to next scene
   */
  private onGateUnlocked(): void {
    console.log('Gate unlocked, transitioning to StairsScene');

    // Fade out
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    // Transition to StairsScene when fade completes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      console.log('Fade complete, cleaning up and starting StairsScene');
      // Manually clean up event listeners before transitioning
      this.cleanupEventListeners();
      this.scene.start('StairsScene');
    });
  }

  /**
   * Clean up event listeners
   */
  private cleanupEventListeners(): void {
    console.log('FachadaScene: Cleaning up event listeners');
    if (this.boundOnGateUnlocked) {
      EventBus.off('gate-unlocked', this.boundOnGateUnlocked);
    }
    if (this.boundOnDialogueEnded) {
      EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    }
  }

  /**
   * Cleanup when scene is shutdown (stopped)
   */
  shutdown(): void {
    this.cleanupEventListeners();
  }
}
