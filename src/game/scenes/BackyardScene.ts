import Phaser from 'phaser';
import { EventBus } from '../EventBus';

/**
 * Backyard Scene - Dark courtyard area (to be implemented)
 * This is a placeholder scene that will be fully implemented in the next task
 */
export class BackyardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BackyardScene' });
  }

  preload(): void {
    // TODO: Load backyard assets in next task
  }

  create(): void {
    console.log('BackyardScene.create() called');

    // Show inventory (it's hidden during intro)
    EventBus.emit('show-inventory');

    const { width, height } = this.cameras.main;

    // Simple dark background for now
    const darkBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

    // Placeholder text
    const text = this.add.text(width / 2, height / 2, 'BACKYARD SCENE\n(To be implemented)', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center',
    });
    text.setOrigin(0.5, 0.5);

    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    console.log('BackyardScene created - placeholder');
  }
}
