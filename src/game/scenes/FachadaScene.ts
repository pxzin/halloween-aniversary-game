import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { createClickableRect, DEBUG_COLORS, enableDebugToggle, clearDebugElements } from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';

/**
 * Fachada Scene - First interactive scene showing the house facade
 * Player must click on the gate to trigger the padlock puzzle
 */
export class FachadaScene extends Phaser.Scene {
  private hasShownIntroDialogue: boolean = false;
  private waitingForPadlockDialogue: boolean = false;

  // Store gate zone reference to enable/disable it
  private gateZone: Phaser.GameObjects.Rectangle | null = null;

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

    // Show inventory (it's hidden during intro)
    EventBus.emit('show-inventory');

    // IMPORTANT: Reset state when scene is created (Phaser reuses scene instances)
    this.hasShownIntroDialogue = false;
    this.waitingForPadlockDialogue = false;
    this.gateZone = null;

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

    // DEV: Log all pointer events in the scene (DISABLED - too verbose)
    // if (import.meta.env.DEV) {
    //   this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    //     console.log(`[FachadaScene] Click at: x=${pointer.x}, y=${pointer.y}`);
    //   });

    //   this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    //     // Log cursor changes
    //     if (this.input.manager.canvas.style.cursor !== this.input.manager.defaultCursor) {
    //       console.log(`[FachadaScene] Cursor changed to pointer at: x=${pointer.x}, y=${pointer.y}`);
    //     }
    //   });
    // }

    // Display facade background - centered and scaled to fit
    const facade = this.add.image(width / 2, height / 2, 'facade');

    // Scale to fit the game view while maintaining aspect ratio
    const scaleX = width / facade.width;
    const scaleY = height / facade.height;
    const scale = Math.max(scaleX, scaleY);
    facade.setScale(scale);

    // Create clickable gate zone
    this.createGateZone();

    // Enable rectangle draw tool (dev mode only)
    enableRectangleDrawTool(this);

    // Enable debug visibility toggle (dev mode only)
    enableDebugToggle(this);

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
      console.log('Facade intro dialogue ended, enabling gate interaction');

      // Enable gate zone interaction
      if (this.gateZone) {
        this.gateZone.setInteractive({ useHandCursor: true });
      }
    }
  }

  /**
   * DEBUG: Create alignment test points to debug mouse position
   */
  private createAlignmentDebugPoints(): void {
    const { width, height } = this.cameras.main;

    // Define 9 test points in a grid pattern
    const points = [
      { x: width * 0.2, y: height * 0.2, num: 1 },   // Top-left
      { x: width * 0.5, y: height * 0.2, num: 2 },   // Top-center
      { x: width * 0.8, y: height * 0.2, num: 3 },   // Top-right
      { x: width * 0.2, y: height * 0.5, num: 4 },   // Middle-left
      { x: width * 0.5, y: height * 0.5, num: 5 },   // Center
      { x: width * 0.8, y: height * 0.5, num: 6 },   // Middle-right
      { x: width * 0.2, y: height * 0.8, num: 7 },   // Bottom-left
      { x: width * 0.5, y: height * 0.8, num: 8 },   // Bottom-center
      { x: width * 0.8, y: height * 0.8, num: 9 },   // Bottom-right
    ];

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎯 ALIGNMENT DEBUG POINTS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Try clicking on each numbered red point.');
    console.log('The console will show the difference between:');
    console.log('- Where you clicked (pointer position)');
    console.log('- Where the point is drawn');
    console.log('');
    console.log('Point positions:');

    points.forEach(point => {
      // Draw red circle
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1);
      graphics.fillCircle(point.x, point.y, 10);
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeCircle(point.x, point.y, 10);

      // Draw number
      const text = this.add.text(point.x, point.y, point.num.toString(), {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      text.setOrigin(0.5, 0.5);

      console.log(`  Point ${point.num}: x=${point.x.toFixed(2)}, y=${point.y.toFixed(2)}`);
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // Listen for clicks and calculate distance to nearest point
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log('');
      console.log('🖱️  CLICK DETECTED:');
      console.log(`   Pointer position: x=${pointer.x.toFixed(2)}, y=${pointer.y.toFixed(2)}`);
      console.log(`   World position: x=${pointer.worldX.toFixed(2)}, y=${pointer.worldY.toFixed(2)}`);
      console.log('');
      console.log('   Distance to each point:');

      points.forEach(point => {
        const dx = pointer.x - point.x;
        const dy = pointer.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const offsetX = pointer.x - point.x;
        const offsetY = pointer.y - point.y;

        console.log(`   Point ${point.num}: distance=${distance.toFixed(2)}px, offset=(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})`);
      });

      // Find closest point
      const closest = points.reduce((prev, curr) => {
        const prevDist = Math.sqrt((pointer.x - prev.x) ** 2 + (pointer.y - prev.y) ** 2);
        const currDist = Math.sqrt((pointer.x - curr.x) ** 2 + (pointer.y - curr.y) ** 2);
        return currDist < prevDist ? curr : prev;
      });

      console.log('');
      console.log(`   ⭐ Closest point: ${closest.num} (${closest.x.toFixed(2)}, ${closest.y.toFixed(2)})`);
      console.log('');
    });
  }

  /**
   * Create an interactive zone over the gate area
   */
  private createGateZone(): void {
    // Coordinates obtained from RectangleDrawTool
    const centerX = 416.11;
    const centerY = 477.77;
    const width = 102.79;
    const height = 270.63;

    // Create clickable gate zone with debug visualization (auto-enabled in dev mode)
    this.gateZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined, // Use default (controlled by DEV_MODE)
      DEBUG_COLORS.CLICKABLE,
      'Gate Zone'
    );

    // Disable interaction until intro dialogue ends
    this.gateZone.disableInteractive();

    // When clicked, show padlock focus dialogue then open padlock
    this.gateZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log(`[FachadaScene] Gate zone clicked at: x=${pointer.x}, y=${pointer.y}`);
      this.onGateClicked();
    });
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
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚪 [FachadaScene] GATE UNLOCKED EVENT RECEIVED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Starting transition to StairsScene...');

    // Fade out
    console.log('Fading out camera...');
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    // Transition to StairsScene when fade completes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      console.log('Camera fade complete');
      console.log('Cleaning up event listeners...');
      // Manually clean up event listeners before transitioning
      this.cleanupEventListeners();
      console.log('Starting StairsScene...');
      this.scene.start('StairsScene');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
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
    clearDebugElements();
  }
}
