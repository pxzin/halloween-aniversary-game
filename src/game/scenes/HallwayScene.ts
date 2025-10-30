import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { createClickableRect, DEBUG_COLORS, enableDebugToggle, clearDebugElements } from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';
import { inventory } from '../../ui/stores';
import { get } from 'svelte/store';

/**
 * Hallway Scene - Central hub with objective reveal and item collection
 * Player can read the Owl's note to reveal objectives and collect the broom
 */
export class HallwayScene extends Phaser.Scene {
  private hasShownIntroDialogue: boolean = false;
  private noteClicked: boolean = false; // Track if note was clicked (prevents re-enabling)
  private noteHasBeenRead: boolean = false;
  private broomCollected: boolean = false;
  private objectivesRevealed: boolean = false;
  private backyardVisited: boolean = false; // Track if player has visited backyard before

  // Store zone references
  private returnZone: Phaser.GameObjects.Rectangle | null = null;
  private noteZone: Phaser.GameObjects.Rectangle | null = null;
  private broomZone1: Phaser.GameObjects.Rectangle | null = null;
  private broomZone2: Phaser.GameObjects.Rectangle | null = null;
  private livingRoomDoorZone: Phaser.GameObjects.Rectangle | null = null;
  private courtyardDoorZone: Phaser.GameObjects.Rectangle | null = null;

  // Visual elements
  private broomVisual: Phaser.GameObjects.Image | null = null;
  private noteVisual: Phaser.GameObjects.Image | null = null;
  private currentBackground: Phaser.GameObjects.Image | null = null;
  private returnText: Phaser.GameObjects.Text | null = null;

  // Store bound function references for proper cleanup
  private boundOnDialogueEnded!: () => void;

  constructor() {
    super({ key: 'HallwayScene' });
  }

  preload(): void {
    // Load hallway backgrounds (with and without broom)
    this.load.image('hallway', '/assets/images/backgrounds/hallway.png');
    this.load.image('hallway_without_broom', '/assets/images/backgrounds/hallway_without_broom.png');

    // Load item sprites
    this.load.image('owls_note_sprite', '/assets/images/sprites/owls_note_item.png');

    // TODO: Load broom sprite
    // this.load.image('broom', '/assets/images/items/broom.png');
  }

  create(): void {
    console.log('HallwayScene.create() called');

    // Show inventory (it's hidden during intro)
    EventBus.emit('show-inventory');

    // Load saved state from sessionStorage
    const savedState = sessionStorage.getItem('hallwaySceneState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.hasShownIntroDialogue = state.hasShownIntroDialogue || false;
      this.noteClicked = state.noteClicked || false;
      this.noteHasBeenRead = state.noteHasBeenRead || false;
      this.broomCollected = state.broomCollected || false;
      this.objectivesRevealed = state.objectivesRevealed || false;
      this.backyardVisited = state.backyardVisited || false;
      console.log('Loaded HallwayScene state:', state);
    } else {
      // First time in scene - initialize state
      this.hasShownIntroDialogue = false;
      this.noteClicked = false;
      this.noteHasBeenRead = false;
      this.broomCollected = false;
      this.objectivesRevealed = false;
      this.backyardVisited = false;
    }

    // Reset zone references
    this.returnZone = null;
    this.noteZone = null;
    this.broomZone1 = null;
    this.broomZone2 = null;
    this.livingRoomDoorZone = null;
    this.courtyardDoorZone = null;
    this.broomVisual = null;
    this.noteVisual = null;
    this.currentBackground = null;
    this.returnText = null;

    // Store bound functions for proper cleanup
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);

    // Listen for events
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);

    const { width, height } = this.cameras.main;

    // Display hallway background - use correct texture based on broomCollected state
    const backgroundTexture = this.broomCollected ? 'hallway_without_broom' : 'hallway';
    this.currentBackground = this.add.image(width / 2, height / 2, backgroundTexture);

    // Scale to fit the game view while maintaining aspect ratio
    const scaleX = width / this.currentBackground.width;
    const scaleY = height / this.currentBackground.height;
    const scale = Math.max(scaleX, scaleY);
    this.currentBackground.setScale(scale);

    console.log(`HallwayScene background set to: ${backgroundTexture} (broomCollected: ${this.broomCollected})`);

    // Create interactive zones (will be enabled after intro dialogue)
    this.createInteractiveZones();

    // Enable rectangle draw tool (dev mode only)
    enableRectangleDrawTool(this);

    // Enable debug visibility toggle (dev mode only)
    enableDebugToggle(this);

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
   * Start the hallway intro dialogue
   */
  private async startIntroDialogue(): Promise<void> {
    await DialogueManager.loadScript('hallway', 'hallway_intro');
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
      noteClicked: this.noteClicked,
      noteHasBeenRead: this.noteHasBeenRead,
      broomCollected: this.broomCollected,
      objectivesRevealed: this.objectivesRevealed,
      backyardVisited: this.backyardVisited,
    };
    sessionStorage.setItem('hallwaySceneState', JSON.stringify(state));
    console.log('Saved HallwayScene state:', state);
  }

  /**
   * Handle dialogue end event
   */
  private onDialogueEnded(): void {
    console.log('HallwayScene.onDialogueEnded');

    // Only proceed if this scene is active
    if (!this.scene.isActive('HallwayScene')) {
      console.log('HallwayScene not active, ignoring dialogue-ended event');
      return;
    }

    // Enable interaction zones after intro dialogue
    if (this.hasShownIntroDialogue) {
      this.enableAllZones();
    }
  }

  /**
   * Enable all interactive zones
   */
  private enableAllZones(): void {
    console.log('Enabling all zones, noteClicked:', this.noteClicked, 'broomCollected:', this.broomCollected);

    if (this.returnZone) {
      this.returnZone.setInteractive({ useHandCursor: true });
      console.log('Return zone enabled');
    }

    // Show return text
    if (this.returnText) {
      this.returnText.setVisible(true);
    }

    // Enable note zone if not clicked yet
    if (this.noteZone && !this.noteClicked) {
      this.noteZone.setInteractive({ useHandCursor: true });
      console.log('Note zone enabled');
    }

    // Enable broom zones if not collected yet
    if (this.broomZone1 && !this.broomCollected) {
      this.broomZone1.setInteractive({ useHandCursor: true });
      console.log('Broom zone 1 enabled');
    }
    if (this.broomZone2 && !this.broomCollected) {
      this.broomZone2.setInteractive({ useHandCursor: true });
      console.log('Broom zone 2 enabled');
    }

    // Enable living room door (always clickable to show locked message)
    if (this.livingRoomDoorZone) {
      this.livingRoomDoorZone.setInteractive({ useHandCursor: true });
      console.log('Living room door zone enabled');
    }

    // Enable courtyard door (transitions to backyard)
    if (this.courtyardDoorZone) {
      this.courtyardDoorZone.setInteractive({ useHandCursor: true });
      console.log('Courtyard door zone enabled');
    }
  }

  /**
   * Create interactive zones
   */
  private createInteractiveZones(): void {
    // Note Zone - Owl's note on the wall
    this.noteZone = createClickableRect(
      this,
      326.77,  // centerX
      309.88,  // centerY
      58.47,   // width
      58.47,   // height
      undefined, // Use default (controlled by DEV_MODE)
      DEBUG_COLORS.HOTSPOT,
      'Owl\'s Note'
    );
    this.noteZone.disableInteractive();
    this.noteZone.on('pointerdown', () => this.onNoteClicked());

    // Create note visual sprite
    this.noteVisual = this.add.image(326.77, 309.88, 'owls_note_sprite');
    this.noteVisual.setOrigin(0.5, 0.5);
    this.noteVisual.setScale(0.08); // 8% of original size

    // Hide if already clicked/collected
    if (this.noteClicked) {
      this.noteVisual.setVisible(false);
    }

    // Broom Zone 1 - Top part of diagonal broom
    this.broomZone1 = createClickableRect(
      this,
      235.73,  // centerX
      322.41,  // centerY
      66.82,   // width
      327.42,  // height
      undefined, // Use default (controlled by DEV_MODE)
      DEBUG_COLORS.ITEM,
      'Broom (Top)'
    );
    this.broomZone1.disableInteractive();
    this.broomZone1.on('pointerdown', () => this.onBroomClicked());

    // Broom Zone 2 - Bottom part of diagonal broom
    this.broomZone2 = createClickableRect(
      this,
      311.74,  // centerX
      582.18,  // centerY
      101.90,  // width
      195.45,  // height
      undefined, // Use default (controlled by DEV_MODE)
      DEBUG_COLORS.ITEM,
      'Broom (Bottom)'
    );
    this.broomZone2.disableInteractive();
    this.broomZone2.on('pointerdown', () => this.onBroomClicked());

    // Living Room Door Zone (locked - shows dialogue)
    this.livingRoomDoorZone = createClickableRect(
      this,
      979.96,  // centerX
      330.77,  // centerY
      155.36,  // width
      564.64,  // height
      undefined, // Use default (controlled by DEV_MODE)
      DEBUG_COLORS.NAVIGATION,
      'Living Room Door (Locked)'
    );
    this.livingRoomDoorZone.disableInteractive();
    this.livingRoomDoorZone.on('pointerdown', () => this.onLivingRoomDoorClicked());

    // Courtyard Door Zone (transitions to backyard)
    this.courtyardDoorZone = createClickableRect(
      this,
      628.31,  // centerX
      309.88,  // centerY
      86.87,   // width
      172.06,  // height
      undefined, // Use default (controlled by DEV_MODE)
      DEBUG_COLORS.NAVIGATION,
      'Courtyard Door'
    );
    this.courtyardDoorZone.disableInteractive();
    this.courtyardDoorZone.on('pointerdown', () => this.onCourtyardDoorClicked());

    // Return to Stairs Zone - Bottom right area
    this.returnZone = createClickableRect(
      this,
      1182.93,  // centerX
      613.09,   // centerY
      183.76,   // width
      207.15,   // height
      undefined, // Use default (controlled by DEV_MODE)
      DEBUG_COLORS.NAVIGATION,
      'Return to Stairs'
    );
    this.returnZone.disableInteractive();
    this.returnZone.on('pointerdown', () => this.returnToStairs());

    // Create return text label (hidden initially)
    this.returnText = this.add.text(
      1182.93,
      613.09,
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

    // TODO: Create broom visual
    // this.broomVisual = this.add.image(273, 452, 'broom'); // Approximate center of both zones
    // if (this.broomCollected) {
    //   this.broomVisual.setVisible(false);
    // }
  }

  /**
   * Handle note click - read the owl's note and reveal objectives
   */
  private async onNoteClicked(): Promise<void> {
    console.log('Note clicked');

    if (this.noteClicked) {
      console.log('Note already clicked, ignoring');
      return;
    }

    // Mark as clicked immediately to prevent double-click
    this.noteClicked = true;
    this.saveState();

    // Disable note zone to prevent multiple clicks
    if (this.noteZone) {
      this.noteZone.disableInteractive();
    }

    // Show pickup dialogue
    await DialogueManager.loadScript('hallway', 'note_pickup');
    DialogueManager.startDialogue();

    // After pickup dialogue ends, show note close-up
    EventBus.once('dialogue-ended', () => {
      // Hide note visual sprite
      if (this.noteVisual) {
        this.noteVisual.setVisible(false);
        console.log('HallwayScene: Note visual hidden');
      }

      // Show close-up with flag to add to inventory after closing
      EventBus.emit('show-note-closeup', { addToInventory: true });

      // Wait for close-up to be closed
      EventBus.once('note-closeup-closed', (data: { addToInventory: boolean }) => {
        if (data.addToInventory) {
          // Trigger item acquisition animation
          EventBus.emit('item-acquired', {
            id: 'owls_note',
            name: 'Bilhete da Coruja',
            icon: '/assets/images/sprites/owls_note_item.png',
          });

          // After item acquisition animation completes, show reading dialogue
          EventBus.once('item-acquisition-complete', async () => {
            await DialogueManager.loadScript('hallway', 'note_reading');
            DialogueManager.startDialogue();

            this.noteHasBeenRead = true;
            this.saveState();

            // After reading dialogue ends, reveal objectives
            EventBus.once('dialogue-ended', () => {
              if (!this.objectivesRevealed) {
                console.log('Revealing objectives');
                EventBus.emit('reveal-objectives');
                this.objectivesRevealed = true;
                this.saveState();
              }
            });
          });
        }
      });
    });
  }

  /**
   * Handle broom click - collect the broom item
   */
  private async onBroomClicked(): Promise<void> {
    console.log('Broom clicked, broomCollected:', this.broomCollected);

    if (this.broomCollected) {
      return;
    }

    // Disable both broom zones
    if (this.broomZone1) {
      this.broomZone1.disableInteractive();
    }
    if (this.broomZone2) {
      this.broomZone2.disableInteractive();
    }

    // Hide broom visual
    if (this.broomVisual) {
      this.broomVisual.setVisible(false);
    }

    // Switch background to version without broom
    if (this.currentBackground) {
      this.currentBackground.setTexture('hallway_without_broom');
      console.log('HallwayScene background changed to: hallway_without_broom');
    }

    this.broomCollected = true;
    this.saveState();

    // Show dialogue
    console.log('Loading found_broom dialogue');
    await DialogueManager.loadScript('hallway', 'found_broom');
    DialogueManager.startDialogue();

    // After dialogue ends, trigger item acquisition animation
    EventBus.once('dialogue-ended', () => {
      EventBus.emit('item-acquired', {
        id: 'broom',
        name: 'Vassoura',
        icon: '/assets/images/ui/broom.png',
      });
    });
  }

  /**
   * Handle living room door click - check for key or show locked dialogue
   */
  private async onLivingRoomDoorClicked(): Promise<void> {
    console.log('Living room door clicked');

    // Check if player has the living room key
    const hasKey = this.checkInventoryForItem('living_room_key');

    if (hasKey) {
      // Player has the key - allow entry
      console.log('Player has living room key, transitioning to LivingRoomScene');
      this.scene.start('LivingRoomScene');
    } else {
      // Show locked door dialogue
      await DialogueManager.loadScript('hallway', 'livingroom_door_locked');
      DialogueManager.startDialogue();
    }
  }

  /**
   * Check if an item exists in the player's inventory
   */
  private checkInventoryForItem(itemId: string): boolean {
    const items = get(inventory);
    return items.some(item => item.id === itemId);
  }

  /**
   * Handle courtyard door click - show reluctance dialogue and transition to backyard
   */
  private async onCourtyardDoorClicked(): Promise<void> {
    console.log('Courtyard door clicked');

    // Disable courtyard door to prevent multiple clicks
    if (this.courtyardDoorZone) {
      this.courtyardDoorZone.disableInteractive();
    }

    // If already visited backyard, skip dialogues and go directly
    if (this.backyardVisited) {
      console.log('Backyard already visited, skipping dialogues');
      this.startBackyardTransition();
      return;
    }

    // First visit - show reluctance dialogue
    await DialogueManager.loadScript('hallway', 'courtyard_door');
    DialogueManager.startDialogue();

    // After reluctance dialogue ends, show narrator transition dialogue
    EventBus.once('dialogue-ended', async () => {
      await DialogueManager.loadScript('hallway', 'courtyard_transition');
      DialogueManager.startDialogue();

      // After narrator dialogue ends, start the animated transition
      EventBus.once('dialogue-ended', () => {
        // Mark backyard as visited
        this.backyardVisited = true;
        this.saveState();
        this.startBackyardTransition();
      });
    });
  }

  /**
   * Animated transition to backyard - zoom in and fade to black
   */
  private startBackyardTransition(): void {
    console.log('Starting backyard transition animation');

    const { width, height } = this.cameras.main;

    // Create a tween that zooms into the background (scale up effect)
    // This gives the impression of walking forward
    this.tweens.add({
      targets: this.currentBackground,
      scaleX: this.currentBackground!.scaleX * 1.5, // Zoom in 50%
      scaleY: this.currentBackground!.scaleY * 1.5,
      duration: 3000, // 3 seconds
      ease: 'Sine.easeIn',
    });

    // Simultaneously fade to black
    this.cameras.main.fadeOut(3000, 0, 0, 0);

    // When fade completes, transition to BackyardScene
    this.cameras.main.once('camerafadeoutcomplete', () => {
      console.log('Transition complete, starting BackyardScene');
      this.cleanupEventListeners();
      this.scene.start('BackyardScene');
    });
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
    console.log('HallwayScene: Cleaning up event listeners');
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
