import Phaser from 'phaser';

/**
 * Boot Scene - responsible for loading essential assets
 * Transitions to IntroScene after loading
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // TODO: Load essential assets here in future tasks
  }

  create(): void {
    // Transition to IntroScene (game always starts with intro/quiz)
    this.scene.start('IntroScene');
  }
}
