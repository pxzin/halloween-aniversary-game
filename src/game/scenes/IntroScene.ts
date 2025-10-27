import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { DialogueManager } from '../services/DialogueManager';

/**
 * Intro Scene - Opening sequence with narrative and quiz minigame
 * This is the first scene the player experiences
 */
export class IntroScene extends Phaser.Scene {
  private currentPhase: string = 'opening';

  constructor() {
    super({ key: 'IntroScene' });
  }

  preload(): void {
    // TODO: Load background and smartphone assets here
    // For now, we'll use placeholder graphics
  }

  create(): void {
    // Set dark dreamlike background
    this.cameras.main.setBackgroundColor('#0a0a1a');

    // Create nightmare background atmosphere
    this.createDarkAtmosphere();

    // Create smartphone placeholder in center
    this.createSmartphone();

    // Start the intro sequence
    this.startIntroSequence();

    // Listen for quiz events
    EventBus.on('quiz-started', this.onQuizStarted.bind(this));
    EventBus.on('quiz-completed', this.onQuizCompleted.bind(this));
    EventBus.on('dialogue-ended', this.onDialogueEnded.bind(this));
  }

  /**
   * Create dark atmospheric background effect
   */
  private createDarkAtmosphere(): void {
    const { width, height } = this.cameras.main;

    // Add some nightmare-esque decorative elements
    const graphics = this.add.graphics();

    // Create a vignette effect
    graphics.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2a, 0x1a0a2a, 0.8, 0.8, 0, 0);
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
        ease: 'Sine.easeInOut'
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

    // Smartphone body (placeholder rectangle)
    const phoneWidth = 200;
    const phoneHeight = 360;

    const phone = this.add.rectangle(
      centerX,
      centerY,
      phoneWidth,
      phoneHeight,
      0x1a1a1a
    );
    phone.setStrokeStyle(4, 0x3a3a3a);

    // Screen area
    const screen = this.add.rectangle(
      centerX,
      centerY,
      phoneWidth - 20,
      phoneHeight - 60,
      0x0a0a0a
    );

    // Add Duolingo-style green glow effect
    const glow = this.add.circle(centerX, centerY, 120, 0x58cc02, 0.1);

    this.tweens.add({
      targets: glow,
      alpha: 0.3,
      scale: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
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
    switch (this.currentPhase) {
      case 'opening':
        // Opening narrative finished, show owl appears dialogue
        this.currentPhase = 'owl_appears';
        this.playOwlAppearsSequence();
        break;

      case 'owl_appears':
        // Owl appears dialogue finished, start quiz
        this.currentPhase = 'quiz';
        EventBus.emit('start-quiz');
        break;

      case 'curse':
        // Curse dialogue finished, show fainting sequence
        this.currentPhase = 'fainting';
        this.playFaintingSequence();
        break;

      case 'fainting':
        // Fainting sequence finished, transition to WorldScene
        this.transitionToWorld();
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
   * Transition to WorldScene with fade effect
   */
  private transitionToWorld(): void {
    this.cameras.main.fadeOut(2000, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene');
    });
  }

  /**
   * Utility function to wait for a specified duration
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }

  /**
   * Cleanup when scene is destroyed
   */
  destroy(): void {
    EventBus.off('quiz-started', this.onQuizStarted.bind(this));
    EventBus.off('quiz-completed', this.onQuizCompleted.bind(this));
    EventBus.off('dialogue-ended', this.onDialogueEnded.bind(this));
    super.destroy();
  }
}
