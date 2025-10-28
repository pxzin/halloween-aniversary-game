import Phaser from 'phaser';

/**
 * Stairs Scene - Scene after unlocking the gate
 * Shows the stairs with closed door
 */
export class StairsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StairsScene' });
  }

  preload(): void {
    // Load stairs background
    this.load.image('stairs', '/assets/images/backgrounds/stairs_door_closed.png');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Display stairs background - centered and scaled to fit
    const stairs = this.add.image(width / 2, height / 2, 'stairs');

    // Scale to fit the game view while maintaining aspect ratio
    const scaleX = width / stairs.width;
    const scaleY = height / stairs.height;
    const scale = Math.max(scaleX, scaleY);
    stairs.setScale(scale);

    // Fade in from black
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // TODO: Add interactivity for the door in future tasks
  }
}
