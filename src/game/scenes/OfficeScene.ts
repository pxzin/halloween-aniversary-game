import Phaser from 'phaser';
import { get } from 'svelte/store';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { inventory, selectedItem } from '../../ui/stores';
import {
  createClickableRect,
  DEBUG_COLORS,
  enableDebugToggle,
  clearDebugElements,
} from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';

/**
 * Office Scene - Final Puzzle: The Pentagram of the Curse
 * Player must place all 5 offerings on the pentagram to break the curse
 */
export class OfficeScene extends Phaser.Scene {
  // State flags
  private hasShownIntroDialogue: boolean = false;
  private offeringsPlaced: Set<string> = new Set();
  private jijiInteractionCount: number = 0; // Track interactions with Jiji

  // Interactive zones
  private pentagramZone: Phaser.GameObjects.Rectangle | null = null;
  private returnZone: Phaser.GameObjects.Rectangle | null = null;
  private jijiZone: Phaser.GameObjects.Rectangle | null = null;

  // Visual elements
  private currentBackground: Phaser.GameObjects.Image | null = null;
  private returnText: Phaser.GameObjects.Text | null = null;
  private placedOfferingsVisuals: Map<string, Phaser.GameObjects.Image> = new Map();

  // Bound function references for cleanup
  private boundOnDialogueEnded!: () => void;

  constructor() {
    super({ key: 'OfficeScene' });
  }

  preload(): void {
    // Load office background (will be ready soon)
    this.load.image('office', '/assets/images/backgrounds/office.png');

    // Load offering icons for visual feedback when placed
    this.load.image('cell_phone_icon', '/assets/images/ui/cell_phone.png');
    this.load.image('wine_icon', '/assets/images/ui/wine.png');
    this.load.image('cheese_icon', '/assets/images/ui/cheese.png');
    this.load.image('chocolates_icon', '/assets/images/ui/chocolates.png');
    this.load.image('clothes_icon', '/assets/images/ui/clothes.png');
  }

  create(): void {
    console.log('[OfficeScene] create() called');

    // Show inventory
    EventBus.emit('show-inventory');

    // Load saved state from sessionStorage
    this.loadState();

    // Store bound functions for proper cleanup
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);

    // Listen for events
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);

    const { width, height } = this.cameras.main;
    console.log(`[OfficeScene] Camera dimensions: ${width}x${height}`);

    // Display background
    this.currentBackground = this.add.image(width / 2, height / 2, 'office');
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

    console.log('[OfficeScene] Scene setup complete');
  }

  /**
   * Load state from sessionStorage
   */
  private loadState(): void {
    const savedState = sessionStorage.getItem('officeSceneState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.hasShownIntroDialogue = state.hasShownIntroDialogue || false;
      this.offeringsPlaced = new Set(state.offeringsPlaced || []);
      this.jijiInteractionCount = state.jijiInteractionCount || 0;
      console.log('[OfficeScene] Loaded state:', state);
    } else {
      // First time in scene
      this.hasShownIntroDialogue = false;
      this.offeringsPlaced = new Set();
      this.jijiInteractionCount = 0;
    }
  }

  /**
   * Save state to sessionStorage
   */
  private saveState(): void {
    const state = {
      hasShownIntroDialogue: this.hasShownIntroDialogue,
      offeringsPlaced: Array.from(this.offeringsPlaced),
      jijiInteractionCount: this.jijiInteractionCount
    };
    sessionStorage.setItem('officeSceneState', JSON.stringify(state));
    console.log('[OfficeScene] Saved state:', state);
  }

  /**
   * Create all interactive zones
   */
  private createInteractiveZones(): void {
    // Clear existing zones
    this.pentagramZone?.destroy();
    this.returnZone?.destroy();
    this.jijiZone?.destroy();
    this.returnText?.destroy();

    // Create return zone (back to living room)
    this.createReturnZone();

    // Create pentagram zone
    this.createPentagramZone();

    // Jiji zone (only if interaction count is less than 4)
    if (this.jijiInteractionCount < 4) {
      this.createJijiZone();
    }

    // Recreate placed offerings visuals if any
    this.recreatePlacedOfferings();
  }

  /**
   * Create return zone to living room
   */
  private createReturnZone(): void {
    // TODO: Adjust coordinates based on actual office background
    const centerX = 100;
    const centerY = 650;
    const width = 150;
    const height = 100;

    this.returnZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.NAVIGATION,
      'Return'
    );
    this.returnZone.on('pointerdown', () => this.onReturnClicked());

    this.returnText = this.add.text(centerX, centerY, '← Voltar', {
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
    this.returnText.setOrigin(0.5);
    this.returnText.setDepth(1000);
  }

  /**
   * Create pentagram interactive zone
   */
  private createPentagramZone(): void {
    // Pentagram coordinates from RectangleDrawTool
    const centerX = 707.66;
    const centerY = 604.73;
    const width = 412.62;
    const height = 190.44;

    this.pentagramZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.HOTSPOT,
      'Pentagram'
    );
    this.pentagramZone.on('pointerdown', () => this.onPentagramClicked());
  }

  /**
   * Create Jiji (cat) interactive zone
   */
  private createJijiZone(): void {
    const centerX = 1067.66;
    const centerY = 426.82;
    const width = 136.98;
    const height = 101.90;

    this.jijiZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.CLICKABLE,
      'Jiji'
    );
    this.jijiZone.on('pointerdown', () => this.onJijiClicked());
  }

  /**
   * Recreate visual indicators for already placed offerings
   */
  private recreatePlacedOfferings(): void {
    // Clear existing visuals
    this.placedOfferingsVisuals.forEach(visual => visual.destroy());
    this.placedOfferingsVisuals.clear();

    // Pentagram center point
    const centerX = 707.66;
    const centerY = 604.73;
    const radius = 80; // Distance from center for each offering

    // Define positions for the 5 offerings (pentagram points)
    const positions = [
      { angle: -90, id: 'cell_phone' },   // Top
      { angle: -18, id: 'wine' },          // Top-right
      { angle: 54, id: 'cheese' },         // Bottom-right
      { angle: 126, id: 'chocolates' },    // Bottom-left
      { angle: 198, id: 'clothes' }        // Top-left
    ];

    // Create visual for each placed offering
    positions.forEach(pos => {
      if (this.offeringsPlaced.has(pos.id)) {
        // Calculate position based on angle
        const x = centerX + Math.cos(pos.angle * Math.PI / 180) * radius;
        const y = centerY + Math.sin(pos.angle * Math.PI / 180) * radius;

        // Create the visual (using the preloaded icon)
        const visual = this.add.image(x, y, `${pos.id}_icon`);
        visual.setScale(0.15);
        visual.setDepth(100);
        visual.setAlpha(0.9);

        // Add a glow effect
        visual.setTint(0xffff00);

        this.placedOfferingsVisuals.set(pos.id, visual);
      }
    });
  }

  /**
   * Show intro dialogue
   */
  private async showIntroDialogue(): Promise<void> {
    console.log('[OfficeScene] Showing intro dialogue');
    await DialogueManager.loadScript('office', 'office_intro');
    DialogueManager.startDialogue();
    this.hasShownIntroDialogue = true;
    this.saveState();
  }

  /**
   * Handle pentagram clicked
   */
  private async onPentagramClicked(): Promise<void> {
    console.log('[OfficeScene] Pentagram clicked');

    const selected = get(selectedItem);

    // If no item selected, show description
    if (!selected) {
      if (this.offeringsPlaced.size === 0) {
        // First time examining pentagram
        await DialogueManager.loadScript('office', 'pentagram_interaction');
        DialogueManager.startDialogue();
      } else {
        // Already placed some offerings
        EventBus.emit('show-dialogue', {
          character: 'jessica',
          text: `Já coloquei ${this.offeringsPlaced.size} de 5 oferendas. Preciso continuar...`,
        });
      }
      return;
    }

    // Check if the selected item is a valid offering
    const offeringIds = [
      'cell_phone',
      'wine',
      'cheese',
      'chocolates',
      'clothes',
    ];

    if (!offeringIds.includes(selected.id)) {
      EventBus.emit('show-dialogue', {
        character: 'jessica',
        text: 'Isso não é uma das oferendas do ritual.',
      });
      selectedItem.set(null);
      return;
    }

    // Check if this offering was already placed
    if (this.offeringsPlaced.has(selected.id)) {
      EventBus.emit('show-dialogue', {
        character: 'jessica',
        text: 'Já coloquei essa oferenda no pentagrama.',
      });
      selectedItem.set(null);
      return;
    }

    // Place the offering
    this.placeOffering(selected.id);
  }

  /**
   * Place an offering on the pentagram
   */
  private placeOffering(offeringId: string): void {
    console.log(`[OfficeScene] Placing offering: ${offeringId}`);

    // Add to placed set
    this.offeringsPlaced.add(offeringId);
    this.saveState();

    // Remove from inventory
    inventory.update((items) => items.filter((i) => i.id !== offeringId));

    // Clear selection
    selectedItem.set(null);

    // Create visual for the placed offering
    this.recreatePlacedOfferings();

    // Show feedback
    EventBus.emit('show-dialogue', {
      character: 'jessica',
      text: `Coloquei a oferenda no pentagrama. ${this.offeringsPlaced.size} de 5 completas.`,
    });

    // Check if all offerings are placed
    if (this.offeringsPlaced.size === 5) {
      console.log('[OfficeScene] All offerings placed! Starting final sequence...');
      setTimeout(() => {
        this.startFinalSequence();
      }, 2000);
    } else {
      // Add a subtle pulse animation to the newly placed offering
      const visual = this.placedOfferingsVisuals.get(offeringId);
      if (visual) {
        this.tweens.add({
          targets: visual,
          scale: 0.18,
          duration: 300,
          yoyo: true,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  /**
   * Start the final sequence (curse breaking)
   */
  private async startFinalSequence(): Promise<void> {
    console.log('[OfficeScene] Starting final sequence');

    // Disable all zones during sequence
    this.pentagramZone?.disableInteractive();
    this.returnZone?.disableInteractive();
    this.jijiZone?.disableInteractive();

    // Create visual effect: make all offerings glow and pulse
    this.placedOfferingsVisuals.forEach((visual, id) => {
      // Pulse animation
      this.tweens.add({
        targets: visual,
        scale: { from: 0.15, to: 0.20 },
        alpha: { from: 0.9, to: 1.0 },
        duration: 500,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut'
      });

      // Add glow effect
      visual.setTint(0xffaa00);
    });

    // Wait for animations to finish before starting rhyme battle
    setTimeout(() => {
      // Start the rhyme battle
      EventBus.emit('start-rhyme-battle');

      // Listen for rhyme battle completion
      EventBus.once('rhyme-battle-completed', async (success: boolean) => {
        if (success) {
          // Show curse breaking dialogue
          await DialogueManager.loadScript('office', 'curse_breaking');
          DialogueManager.startDialogue();

          // After dialogue ends, show happy birthday screen
          EventBus.once('dialogue-ended', () => {
            EventBus.emit('show-happy-birthday');
          });
        } else {
          // Player failed the rhyme battle - reset?
          // TODO: Decide what happens on failure
          console.log('[OfficeScene] Rhyme battle failed');
        }
      });
    }, 2500);
  }

  /**
   * Handle Jiji (cat) clicked - show progressive dialogues
   */
  private async onJijiClicked(): Promise<void> {
    console.log('[OfficeScene] Jiji clicked - interaction count:', this.jijiInteractionCount);

    // Show appropriate dialogue based on interaction count
    let dialogueKey = '';
    switch (this.jijiInteractionCount) {
      case 0:
        dialogueKey = 'jiji_first_encounter';
        break;
      case 1:
        dialogueKey = 'jiji_second_attempt';
        break;
      case 2:
        dialogueKey = 'jiji_third_attempt';
        break;
      case 3:
        dialogueKey = 'jiji_give_up';
        break;
      default:
        // After 4 interactions, don't show anything (zone will be removed)
        return;
    }

    // Increment interaction count
    this.jijiInteractionCount++;
    this.saveState();

    // Show dialogue
    await DialogueManager.loadScript('office', dialogueKey);
    DialogueManager.startDialogue();

    // After the 4th interaction (give up), remove the zone
    if (this.jijiInteractionCount >= 4) {
      EventBus.once('dialogue-ended', () => {
        if (this.scene.isActive('OfficeScene')) {
          this.jijiZone?.destroy();
          this.jijiZone = null;
        }
      });
    }
  }

  /**
   * Handle return clicked
   */
  private onReturnClicked(): void {
    console.log('[OfficeScene] Returning to Living Room');
    this.scene.start('LivingRoomScene');
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
    console.log('[OfficeScene] shutdown() called');

    // Remove event listeners
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);

    // Clear debug elements
    clearDebugElements();
  }
}
