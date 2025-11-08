import Phaser from 'phaser';
import { get } from 'svelte/store';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';
import { addMinutesToGameTime, inventory } from '../../ui/stores';
import { createClickableRect, DEBUG_COLORS, enableDebugToggle, clearDebugElements } from '../utils/DebugHelpers';
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';

/**
 * Living Room Scene - Scaredy Cat Puzzle
 * Player must tidy up the room, then scare Sombra away to get the cell phone
 */
export class LivingRoomScene extends Phaser.Scene {
  // State flags
  private hasShownIntroDialogue: boolean = false;
  private roomTidy: boolean = false; // Chairs cleared
  private cabinetOpened: boolean = false; // Cabinet accessed
  private sombraScared: boolean = false; // Cat scared away
  private cellPhoneCollected: boolean = false;
  private officeUnlocked: boolean = false; // Office door unlocked after collecting all offerings

  // Interactive zones
  private chairsZone: Phaser.GameObjects.Rectangle | null = null;
  private cabinetZone: Phaser.GameObjects.Rectangle | null = null;
  private hallwayZone: Phaser.GameObjects.Rectangle | null = null;
  private officeZone: Phaser.GameObjects.Rectangle | null = null;
  private kitchenZone: Phaser.GameObjects.Rectangle | null = null;

  // Visual elements
  private currentBackground: Phaser.GameObjects.Image | null = null;
  private hallwayText: Phaser.GameObjects.Text | null = null;
  private kitchenText: Phaser.GameObjects.Text | null = null;
  private officeText: Phaser.GameObjects.Text | null = null;

  // Closeup state
  private isCloseupActive: boolean = false;

  // Bound function references for cleanup
  private boundOnDialogueEnded!: () => void;
  private boundOnChoiceMade!: (data: { choice: string }) => void;
  private boundOnCloseupClosed!: () => void;
  private boundOnAllOfferingsCollected!: () => void;
  private boundUpdateAfterDialogue: (() => void) | null = null;

  constructor() {
    super({ key: 'LivingRoomScene' });
  }

  preload(): void {
    // Load backgrounds
    this.load.image('living_room_messy', '/assets/images/backgrounds/living_room_messy.png');
    this.load.image('living_room_tidy', '/assets/images/backgrounds/living_room_tidy.png');

    // Load closeup images
    this.load.image('cat_puzzle_phone', '/assets/images/ui/cat_puzzle_phone.png');
    this.load.image('cat_puzzle_phone_solved', '/assets/images/ui/cat_puzzle_phone_solved.png');
  }

  create(): void {
    console.log('[LivingRoomScene] create() called');

    // Show inventory
    EventBus.emit('show-inventory');

    // Load saved state from sessionStorage
    this.loadState();

    // Store bound functions for proper cleanup
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);
    this.boundOnChoiceMade = this.onChoiceMade.bind(this);
    this.boundOnCloseupClosed = this.onCloseupClosed.bind(this);
    this.boundOnAllOfferingsCollected = this.onAllOfferingsCollected.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.off('choice-made', this.boundOnChoiceMade);
    EventBus.off('closeup-closed', this.boundOnCloseupClosed);
    EventBus.off('all-offerings-collected', this.boundOnAllOfferingsCollected);

    // Listen for events
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.on('choice-made', this.boundOnChoiceMade);
    EventBus.on('closeup-closed', this.boundOnCloseupClosed);
    EventBus.on('all-offerings-collected', this.boundOnAllOfferingsCollected);

    const { width, height } = this.cameras.main;
    console.log(`[LivingRoomScene] Camera dimensions: ${width}x${height}`);

    // Display appropriate background
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

    console.log('[LivingRoomScene] Scene setup complete');
  }

  /**
   * Load state from sessionStorage
   */
  private loadState(): void {
    const savedState = sessionStorage.getItem('livingRoomSceneState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.hasShownIntroDialogue = state.hasShownIntroDialogue || false;
      this.roomTidy = state.roomTidy || false;
      this.cabinetOpened = state.cabinetOpened || false;
      this.sombraScared = state.sombraScared || false;
      this.cellPhoneCollected = state.cellPhoneCollected || false;
      this.officeUnlocked = state.officeUnlocked || false;
      console.log('[LivingRoomScene] Loaded state:', state);
    } else {
      // First time in scene
      this.hasShownIntroDialogue = false;
      this.roomTidy = false;
      this.cabinetOpened = false;
      this.sombraScared = false;
      this.cellPhoneCollected = false;
      this.officeUnlocked = false;
    }
  }

  /**
   * Save state to sessionStorage
   */
  private saveState(): void {
    const state = {
      hasShownIntroDialogue: this.hasShownIntroDialogue,
      roomTidy: this.roomTidy,
      cabinetOpened: this.cabinetOpened,
      sombraScared: this.sombraScared,
      cellPhoneCollected: this.cellPhoneCollected,
      officeUnlocked: this.officeUnlocked
    };
    sessionStorage.setItem('livingRoomSceneState', JSON.stringify(state));
    console.log('[LivingRoomScene] Saved state:', state);
  }

  /**
   * Update background based on room state
   */
  private updateBackground(): void {
    // Safety check: ensure cameras are available
    if (!this.cameras || !this.cameras.main) {
      console.warn('[LivingRoomScene] Cannot update background - cameras not ready');
      return;
    }

    const { width, height } = this.cameras.main;

    // Remove old background if exists
    if (this.currentBackground) {
      this.currentBackground.destroy();
    }

    // Show tidy room if cleaned, otherwise messy room
    const backgroundKey = this.roomTidy ? 'living_room_tidy' : 'living_room_messy';
    this.currentBackground = this.add.image(width / 2, height / 2, backgroundKey);
    this.currentBackground.setDisplaySize(width, height);
    this.currentBackground.setDepth(0);

    console.log(`[LivingRoomScene] Background updated to: ${backgroundKey}`);
  }

  /**
   * Create all interactive zones
   */
  private createInteractiveZones(): void {
    // Clear existing zones
    this.chairsZone?.destroy();
    this.cabinetZone?.destroy();
    this.hallwayZone?.destroy();
    this.officeZone?.destroy();
    this.kitchenZone?.destroy();

    // Clear existing texts
    this.hallwayText?.destroy();
    this.kitchenText?.destroy();
    this.officeText?.destroy();

    // Navigation zone - Hallway (always available)
    this.createHallwayZone();

    // Navigation zone - Kitchen (always available)
    this.createKitchenZone();

    // Navigation zone - Office (only available if room is tidy)
    if (this.roomTidy) {
      this.createOfficeZone();
    }

    // IMPORTANT: Cabinet zone must be created BEFORE chairs zone
    // to ensure chairs appear on top when room is messy
    // Cabinet zone (always available, behavior changes based on state)
    this.createCabinetZone();

    // Chairs zone (only if not tidy yet)
    // Created last so it appears on top of cabinet
    if (!this.roomTidy) {
      this.createChairsZone();
    }
  }

  /**
   * Create hallway navigation zone
   */
  private createHallwayZone(): void {
    const centerX = 118.79;
    const centerY = 656.52;
    const width = 207.15;
    const height = 113.60;

    this.hallwayZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.NAVIGATION,
      'Voltar'
    );
    this.hallwayZone.on('pointerdown', () => this.onHallwayClicked());

    // Add visible text
    this.hallwayText = this.add.text(centerX, centerY, '← Voltar', {
      fontSize: '24px',
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
    this.hallwayText.setOrigin(0.5);
    this.hallwayText.setDepth(1000);
  }

  /**
   * Create kitchen navigation zone
   */
  private createKitchenZone(): void {
    const centerX = 79.53;
    const centerY = 198.79;
    const width = 145.34;
    const height = 203.81;

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

    // Add visible text
    this.kitchenText = this.add.text(centerX, centerY, '← Cozinha', {
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
    this.kitchenText.setOrigin(0.5);
    this.kitchenText.setDepth(1000);
  }

  /**
   * Create office navigation zone
   */
  private createOfficeZone(): void {
    const centerX = 798.70;
    const centerY = 210.49;
    const width = 130.30;
    const height = 263.94;

    this.officeZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.NAVIGATION,
      'Escritório'
    );
    this.officeZone.on('pointerdown', () => this.onOfficeClicked());

    // Add visible text
    this.officeText = this.add.text(centerX, centerY, 'Escritório →', {
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
    this.officeText.setOrigin(0.5);
    this.officeText.setDepth(1000);
  }

  /**
   * Create chairs interactive zone
   */
  private createChairsZone(): void {
    const centerX = 604.08;
    const centerY = 487.80;
    const width = 649.84;
    const height = 263.94;

    this.chairsZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.CLICKABLE,
      'Cadeiras'
    );
    this.chairsZone.on('pointerdown', () => this.onChairsClicked());
  }

  /**
   * Create cabinet interactive zone
   */
  private createCabinetZone(): void {
    const centerX = 487.98;
    const centerY = 326.59;
    const width = 290.67;
    const height = 202.13;

    this.cabinetZone = createClickableRect(
      this,
      centerX,
      centerY,
      width,
      height,
      undefined,
      DEBUG_COLORS.HOTSPOT,
      'Armário'
    );
    this.cabinetZone.on('pointerdown', () => this.onCabinetClicked());
  }

  /**
   * Show intro dialogue
   */
  private async showIntroDialogue(): Promise<void> {
    console.log('[LivingRoomScene] Showing intro dialogue');
    await DialogueManager.loadScript('living_room', 'living_room_intro');
    DialogueManager.startDialogue();
    this.hasShownIntroDialogue = true;
    this.saveState();
  }

  /**
   * Handle chairs clicked - show confirmation dialog
   */
  private onChairsClicked(): void {
    console.log('[LivingRoomScene] Chairs clicked - showing confirmation');

    // Show choice dialog asking if player wants to tidy up
    // The global choice handler will route this to handleTidyChoice()
    EventBus.emit('show-choices', {
      choices: [
        { id: 'tidy_yes', text: 'Sim, arrumar a sala (5 minutos)' },
        { id: 'tidy_no', text: 'Não, deixar como está' }
      ]
    });
  }

  /**
   * Actually perform the tidy-up action
   */
  private async performTidyUp(): Promise<void> {
    console.log('[LivingRoomScene] Performing tidy up');

    // Load and start tidy up dialogue
    await DialogueManager.loadScript('living_room', 'room_tidy_up');
    DialogueManager.startDialogue();

    // Apply time penalty (5 minutes)
    addMinutesToGameTime(5);
    console.log('[LivingRoomScene] Applied 5-minute time penalty');

    // Mark room as tidy and update scene
    this.roomTidy = true;
    this.saveState();

    // Update background and zones after dialogue ends
    // Store reference to cancel if scene changes
    this.boundUpdateAfterDialogue = () => {
      console.log('[LivingRoomScene] Dialogue ended, updating scene...');

      // Verify we're still in this scene before updating
      if (this.scene.isActive('LivingRoomScene')) {
        // Small delay to ensure scene is fully ready
        this.time.delayedCall(100, () => {
          this.updateBackground();
          this.createInteractiveZones();
        });
      } else {
        console.log('[LivingRoomScene] Scene changed, skipping update');
      }

      // Clear reference after use
      this.boundUpdateAfterDialogue = null;
    };
    EventBus.once('dialogue-ended', this.boundUpdateAfterDialogue);
  }

  /**
   * Handle cabinet clicked
   */
  private async onCabinetClicked(): Promise<void> {
    console.log('[LivingRoomScene] Cabinet clicked');

    // Check if room is tidy
    if (!this.roomTidy) {
      // Show blocked dialogue
      await DialogueManager.loadScript('living_room', 'living_room_intro');
      DialogueManager.startDialogue();
      return;
    }

    // Room is tidy - show closeup
    this.showCatCloseup();
    this.cabinetOpened = true;
    this.saveState();
  }

  /**
   * Show cat closeup with interactive elements
   */
  private showCatCloseup(): void {
    console.log('[LivingRoomScene] Showing cat closeup');
    this.isCloseupActive = true;

    // Use solved image if cat is scared, otherwise show cat with phone
    const closeupImage = this.sombraScared ? 'cat_puzzle_phone_solved' : 'cat_puzzle_phone';

    // Remove any existing closeup-zone-clicked listeners before adding new one
    EventBus.off('closeup-zone-clicked');

    EventBus.emit('show-closeup', {
      image: closeupImage,
      title: 'Aparador',
      zones: this.sombraScared ? [
        // Phone zone - centered on closeup
        {
          id: 'cell_phone',
          x: 350,      // Centered horizontally (assuming ~1000px width)
          y: 250,      // Centered vertically (assuming ~700px height)
          width: 300,
          height: 200,
          label: 'Interagir'
        }
      ] : [
        // Cat zone - centered on closeup
        {
          id: 'sombra',
          x: 350,      // Centered horizontally (assuming ~1000px width)
          y: 250,      // Centered vertically (assuming ~700px height)
          width: 300,
          height: 200,
          label: 'Interagir'
        }
      ]
    });

    // Set up zone click handlers (only once)
    EventBus.once('closeup-zone-clicked', (data: { zoneId: string }) => {
      console.log('[LivingRoomScene] Zone clicked in closeup:', data.zoneId);

      if (data.zoneId === 'sombra') {
        this.onSombraClicked();
      } else if (data.zoneId === 'cell_phone') {
        this.onCellPhoneClicked();
      }
    });
  }

  /**
   * Handle Sombra (cat) clicked in closeup
   */
  private async onSombraClicked(): Promise<void> {
    console.log('[LivingRoomScene] Sombra clicked');

    // Close the closeup before dialogue
    EventBus.emit('close-closeup');

    // First show the sombra_sleeping dialogue
    await DialogueManager.loadScript('living_room', 'sombra_sleeping');
    DialogueManager.startDialogue();

    // After dialogue, show choices
    const onSleepingDialogueEnd = async () => {
      console.log('[LivingRoomScene] Sombra sleeping dialogue ended');

      // Only proceed if scene is still active
      if (!this.scene.isActive('LivingRoomScene')) {
        console.log('[LivingRoomScene] Scene not active, aborting sombra puzzle');
        return;
      }

      // Load and show choices dialogue
      await DialogueManager.loadScript('living_room', 'sombra_choices');
      DialogueManager.startDialogue();

      // Present choices to player after second dialogue
      const onChoicesDialogueEnd = () => {
        console.log('[LivingRoomScene] Sombra choices dialogue ended');

        // Only proceed if scene is still active
        if (!this.scene.isActive('LivingRoomScene')) {
          console.log('[LivingRoomScene] Scene not active, aborting sombra choices');
          return;
        }

        EventBus.emit('show-choices', {
          choices: [
            { id: 'yell', text: 'Gritar com a gata' },
            { id: 'pspsps', text: 'Fazer pspspsps' },
            { id: 'clap', text: 'Bater palmas' }
          ]
        });
      };

      EventBus.once('dialogue-ended', onChoicesDialogueEnd);
    };

    EventBus.once('dialogue-ended', onSleepingDialogueEnd);
  }

  /**
   * Handle choice made - routes to appropriate handler
   */
  private onChoiceMade(data: { choice: string }): void {
    console.log('[LivingRoomScene] Choice made:', data.choice);

    // Check if it's a Sombra choice (yell, pspsps, clap)
    if (['yell', 'pspsps', 'clap'].includes(data.choice)) {
      this.handleSombraChoice(data.choice);
      return;
    }

    // Check if it's a tidying choice (tidy_yes, tidy_no)
    if (['tidy_yes', 'tidy_no'].includes(data.choice)) {
      this.handleTidyChoice(data.choice);
      return;
    }

    console.warn('[LivingRoomScene] Unknown choice:', data.choice);
  }

  /**
   * Handle Sombra-related choices
   */
  private async handleSombraChoice(choice: string): Promise<void> {
    console.log('[LivingRoomScene] Handling Sombra choice:', choice);

    // Only proceed if scene is active
    if (!this.scene.isActive('LivingRoomScene')) {
      console.log('[LivingRoomScene] Scene not active, ignoring sombra choice');
      return;
    }

    switch (choice) {
      case 'yell':
        // Wrong choice - cat stays
        await DialogueManager.loadScript('living_room', 'sombra_yell');
        DialogueManager.startDialogue();
        break;

      case 'pspsps':
        // Wrong choice - cat stays
        await DialogueManager.loadScript('living_room', 'sombra_pspsps');
        DialogueManager.startDialogue();
        break;

      case 'clap':
        // Correct choice - cat runs away
        await DialogueManager.loadScript('living_room', 'sombra_clap');
        DialogueManager.startDialogue();
        this.sombraScared = true;
        this.saveState();

        // After dialogue, refresh closeup to show phone (only if not collected yet)
        if (!this.cellPhoneCollected) {
          const onClapDialogueEnd = () => {
            console.log('[LivingRoomScene] Clap dialogue ended, showing phone closeup');

            // Only proceed if scene is still active
            if (!this.scene.isActive('LivingRoomScene')) {
              console.log('[LivingRoomScene] Scene not active, skipping closeup');
              return;
            }

            EventBus.emit('close-closeup');
            this.showCatCloseup();
          };

          EventBus.once('dialogue-ended', onClapDialogueEnd);
        }
        break;
    }
  }

  /**
   * Handle tidying choices
   */
  private handleTidyChoice(choice: string): void {
    if (choice === 'tidy_yes') {
      // Player chose to tidy up
      this.performTidyUp();
    } else {
      // Player chose not to tidy up
      console.log('[LivingRoomScene] Player declined to tidy up');
    }
  }

  /**
   * Handle cell phone clicked in closeup
   */
  private async onCellPhoneClicked(): Promise<void> {
    console.log('[LivingRoomScene] Cell phone clicked');

    // Prevent double collection
    if (this.cellPhoneCollected) {
      console.log('[LivingRoomScene] Cell phone already collected, ignoring');
      EventBus.emit('close-closeup');
      return;
    }

    // Close the closeup
    EventBus.emit('close-closeup');

    // Mark as collected immediately to prevent double-click
    this.cellPhoneCollected = true;
    this.saveState();

    // Show item acquisition animation with phone emoji
    EventBus.emit('item-acquired', {
      id: 'cell_phone',
      name: 'Celular',
      icon: '📱'
    });

    // Wait for animation to complete
    const onAnimationComplete = async () => {
      console.log('[LivingRoomScene] Item acquisition animation complete');

      // Only proceed if scene is still active
      if (!this.scene.isActive('LivingRoomScene')) {
        console.log('[LivingRoomScene] Scene not active, skipping dialogue');
        return;
      }

      // Show dialogue after animation
      await DialogueManager.loadScript('living_room', 'found_cellphone');
      DialogueManager.startDialogue();

      // Mark offering as collected (after dialogue)
      const onPhoneDialogueEnd = () => {
        console.log('[LivingRoomScene] Cell phone dialogue ended, marking offering');

        // Only proceed if scene is still active
        if (!this.scene.isActive('LivingRoomScene')) {
          console.log('[LivingRoomScene] Scene not active, skipping offering event');
          return;
        }

        EventBus.emit('gift-collected', {
          giftId: 'gift1'
        });
        console.log('[LivingRoomScene] Cell phone offering collected');
      };

      EventBus.once('dialogue-ended', onPhoneDialogueEnd);
    };

    EventBus.once('item-acquisition-complete', onAnimationComplete);
  }

  /**
   * Handle closeup closed event
   */
  private onCloseupClosed(): void {
    console.log('[LivingRoomScene] Closeup closed');
    this.isCloseupActive = false;
  }

  /**
   * Handle hallway navigation
   */
  private onHallwayClicked(): void {
    console.log('[LivingRoomScene] Navigating to Hallway');
    this.scene.start('HallwayScene');
  }

  /**
   * Handle kitchen navigation
   */
  private onKitchenClicked(): void {
    console.log('[LivingRoomScene] Navigating to Kitchen');
    this.scene.start('KitchenScene');
  }

  /**
   * Handle office navigation
   */
  private onOfficeClicked(): void {
    console.log('[LivingRoomScene] Office door clicked');

    // Check if office is unlocked
    if (!this.officeUnlocked) {
      console.log('[LivingRoomScene] Office door is still locked');

      // Check how many offerings the player has
      const currentInventory = get(inventory);
      const offeringIds = ['cell_phone', 'wine', 'cheese', 'chocolates', 'clothes'];
      const offeringsInInventory = currentInventory.filter(item => offeringIds.includes(item.id));

      // Show appropriate dialogue
      if (offeringsInInventory.length === 0) {
        EventBus.emit('show-dialogue', {
          character: 'jessica',
          text: 'A porta do escritório está trancada. Parece que preciso encontrar algo para destrancá-la...'
        });
      } else {
        EventBus.emit('show-dialogue', {
          character: 'jessica',
          text: `Tenho ${offeringsInInventory.length} de 5 oferendas. A porta ainda está trancada...`
        });
      }
      return;
    }

    // Office is unlocked, navigate to it
    console.log('[LivingRoomScene] Navigating to Office');
    this.scene.start('OfficeScene');
  }

  /**
   * Handle all offerings collected event
   */
  private onAllOfferingsCollected(): void {
    console.log('[LivingRoomScene] All offerings collected! Unlocking office door');
    this.officeUnlocked = true;
    this.saveState();
  }

  /**
   * Handle dialogue ended event
   */
  private onDialogueEnded(): void {
    // Generic handler for dialogue endings that don't need specific logic
    console.log('[LivingRoomScene] Dialogue ended');

    // Only proceed if this scene is active
    if (!this.scene.isActive('LivingRoomScene')) {
      console.log('[LivingRoomScene] Scene not active, ignoring dialogue-ended event');
      return;
    }

    // This is just a generic fallback - specific handlers use EventBus.once
    // No action needed here
  }

  /**
   * Cleanup when scene is shutdown
   */
  shutdown(): void {
    console.log('[LivingRoomScene] Shutting down');

    // Remove event listeners
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);
    EventBus.off('choice-made', this.boundOnChoiceMade);
    EventBus.off('closeup-closed', this.boundOnCloseupClosed);
    EventBus.off('all-offerings-collected', this.boundOnAllOfferingsCollected);

    // Remove the update callback if it's still pending
    if (this.boundUpdateAfterDialogue) {
      EventBus.off('dialogue-ended', this.boundUpdateAfterDialogue);
      this.boundUpdateAfterDialogue = null;
    }

    // Clear debug elements
    clearDebugElements();
  }
}
