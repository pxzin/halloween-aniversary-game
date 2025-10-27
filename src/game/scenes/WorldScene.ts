import Phaser from 'phaser';
import { EventBus } from '../EventBus';

/**
 * World Scene - main gameplay scene for point-and-click adventure
 * This is where the player will navigate through different locations
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  create(): void {
    // Emit event to hide main menu UI
    EventBus.emit('hide-main-menu');

    // TODO: Implement point-and-click gameplay in future tasks

    // For now, just display a placeholder text
    this.add.text(400, 300, 'World Scene - Gameplay Area', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
