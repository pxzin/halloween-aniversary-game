import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';

/**
 * Intro Scene - Opening sequence with narrative and quiz minigame
 * This is the first scene the player experiences
 */
export class IntroScene extends Phaser.Scene {
  private currentPhase: string = 'opening';

  // Store bound function references for proper cleanup
  private boundOnQuizStarted!: () => void;
  private boundOnQuizCompleted!: () => void;
  private boundOnDialogueEnded!: () => void;

  constructor() {
    super({ key: 'IntroScene' });
  }

  preload(): void {
    // Load smartphone sprite
    this.load.image('phone_intro', '/assets/images/ui/phone_intro.png');
  }

  create(): void {
    console.log('IntroScene.create() called');

    // Hide inventory during intro to prevent premature item usage
    EventBus.emit('hide-inventory');

    // IMPORTANT: Reset state when scene is created (Phaser reuses scene instances)
    this.currentPhase = 'opening';
    console.log('IntroScene: Reset currentPhase to opening');

    // Store bound functions for proper cleanup (do this BEFORE registering listeners)
    this.boundOnQuizStarted = this.onQuizStarted.bind(this);
    this.boundOnQuizCompleted = this.onQuizCompleted.bind(this);
    this.boundOnDialogueEnded = this.onDialogueEnded.bind(this);

    // Remove any existing listeners to prevent duplicates
    EventBus.off('quiz-started', this.boundOnQuizStarted);
    EventBus.off('quiz-completed', this.boundOnQuizCompleted);
    EventBus.off('dialogue-ended', this.boundOnDialogueEnded);

    // Listen for quiz events
    EventBus.on('quiz-started', this.boundOnQuizStarted);
    EventBus.on('quiz-completed', this.boundOnQuizCompleted);
    EventBus.on('dialogue-ended', this.boundOnDialogueEnded);

    // Set dark background to match phone sprite
    this.cameras.main.setBackgroundColor('#02060f');

    // Create nightmare background atmosphere
    this.createDarkAtmosphere();

    // Create smartphone placeholder in center
    this.createSmartphone();

    // Start the intro sequence
    this.startIntroSequence();
  }

  /**
   * Create dark atmospheric background effect
   */
  private createDarkAtmosphere(): void {
    const { width, height } = this.cameras.main;

    // Add some nightmare-esque decorative elements
    const graphics = this.add.graphics();

    // Create a vignette effect

    graphics.fillRect(0, 0, width, height);

    // Add some floating "nightmare" particles
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;

      const particle = this.add.circle(x, y, size, 0x4a0a5a, 0.3);

      // Animate particles slowly
      this.tweens.add({
        targets: particle,
        y: y + Math.random() * 100 - 50,
        alpha: Math.random() * 0.5,
        duration: Math.random() * 3000 + 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Create smartphone visual in the center
   */
  private createSmartphone(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Add phone sprite
    const phone = this.add.image(centerX, centerY, 'phone_intro');

    // Scale phone to appropriate size (adjust as needed)
    phone.setScale(0.35);

    // Add pulsing animation to the entire phone for notification effect
    // This creates a subtle breathing effect
    this.tweens.add({
      targets: phone,
      scale: 0.37,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Add Duolingo-style green glow effect behind the phone
    const glow = this.add.circle(centerX, centerY, 150, 0x58cc02, 0.15);
    glow.setDepth(-1); // Place glow behind phone

    this.tweens.add({
      targets: glow,
      alpha: 0.3,
      scale: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Start the intro narrative sequence
   */
  private async startIntroSequence(): void {
    // Load and start opening narrative
    await DialogueManager.loadScript('intro', 'opening_narrative');
    DialogueManager.startDialogue();
  }

  /**
   * Handle dialogue end event
   */
  private onDialogueEnded(): void {
    console.log('IntroScene.onDialogueEnded - currentPhase:', this.currentPhase);

    // Only proceed if this scene is active
    if (!this.scene.isActive('IntroScene')) {
      console.log('IntroScene not active, ignoring dialogue-ended event');
      return;
    }

    switch (this.currentPhase) {
      case 'opening':
        // Opening narrative finished, show owl appears dialogue
        console.log('IntroScene: Opening narrative finished, showing owl appears');
        this.currentPhase = 'owl_appears';
        this.playOwlAppearsSequence();
        break;

      case 'owl_appears':
        // Owl appears dialogue finished, start quiz
        console.log('IntroScene: Owl appears finished, starting quiz');
        this.currentPhase = 'quiz';
        EventBus.emit('start-quiz');
        break;

      case 'curse':
        // Curse dialogue finished, show fainting sequence
        console.log('IntroScene: Curse finished, showing fainting sequence');
        this.currentPhase = 'fainting';
        this.playFaintingSequence();
        break;

      case 'fainting':
        // Fainting sequence finished, transition to FachadaScene
        console.log('IntroScene: Fainting finished, transitioning to FachadaScene');
        this.transitionToWorld();
        break;

      default:
        console.warn('IntroScene.onDialogueEnded - Unexpected phase:', this.currentPhase);
        break;
    }
  }

  /**
   * Play owl appears dialogue sequence
   */
  private async playOwlAppearsSequence(): void {
    await DialogueManager.loadScript('intro', 'owl_appears');
    DialogueManager.startDialogue();
  }

  /**
   * Handle quiz start event
   */
  private onQuizStarted(): void {
    // Hide smartphone or animate it as needed
    console.log('Quiz started');
  }

  /**
   * Handle quiz completion event
   */
  private async onQuizCompleted(): void {
    this.currentPhase = 'curse';

    // Add dramatic pause
    await this.wait(1000);

    // Flash the screen green for dramatic effect
    this.cameras.main.flash(500, 88, 204, 2);

    // Start curse dialogue
    await DialogueManager.loadScript('intro', 'curse_dialogue');
    DialogueManager.startDialogue();
  }

  /**
   * Play fainting sequence
   */
  private async playFaintingSequence(): void {
    await DialogueManager.loadScript('intro', 'fainting_sequence');
    DialogueManager.startDialogue();
  }

  /**
   * Transition to FachadaScene with fade effect
   */
  private transitionToWorld(): void {
    console.log('IntroScene.transitionToWorld called - currentPhase:', this.currentPhase);

    // Only transition if we're actually in the fainting phase
    if (this.currentPhase !== 'fainting') {
      console.warn('transitionToWorld called but not in fainting phase, skipping');
      return;
    }

    // Check if scene manager exists and scene is still active
    if (!this.scene || !this.scene.isActive || !this.scene.isActive('IntroScene')) {
      console.warn('IntroScene is not active or scene manager unavailable, transitioning directly');
      if (this.scene && this.scene.start) {
        this.scene.start('FachadaScene');
      }
      return;
    }

    // Check if camera exists
    if (!this.cameras || !this.cameras.main) {
      console.warn('Camera not available, transitioning directly');
      this.scene.start('FachadaScene');
      return;
    }

    console.log('Starting fade out transition to FachadaScene');
    this.cameras.main.fadeOut(2000, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      console.log('Fade complete, cleaning up and starting FachadaScene');
      // Manually clean up event listeners before transitioning
      this.cleanupEventListeners();
      this.scene.start('FachadaScene');
    });
  }

  /**
   * Utility function to wait for a specified duration
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.time.delayedCall(ms, resolve);
    });
  }

  /**
   * Clean up event listeners
   */
  private cleanupEventListeners(): void {
    console.log('IntroScene: Cleaning up event listeners');
    if (this.boundOnQuizStarted) {
      EventBus.off('quiz-started', this.boundOnQuizStarted);
    }
    if (this.boundOnQuizCompleted) {
      EventBus.off('quiz-completed', this.boundOnQuizCompleted);
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
