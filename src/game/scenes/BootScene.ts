import Phaser from 'phaser';

/**
 * Boot Scene - responsible for loading essential assets
 * Currently transitions directly to MainMenuScene
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // TODO: Load essential assets here in future tasks
  }

  create(): void {
    // Transition to MainMenuScene
    this.scene.start('MainMenuScene');
  }
}
