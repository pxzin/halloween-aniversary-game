import Phaser from 'phaser';
import { EventBus } from '../EventBus';

/**
 * Main Menu Scene - displays the main menu
 * Communicates with Svelte UI via EventBus
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    // Emit event to show main menu UI in Svelte
    EventBus.emit('show-main-menu');

    // Listen for start-game event from Svelte UI
    EventBus.on('start-game', this.startGame.bind(this));
  }

  private startGame(): void {
    // Remove listener to prevent memory leaks
    EventBus.off('start-game', this.startGame.bind(this));

    // Transition to IntroScene
    this.scene.start('IntroScene');
  }

  destroy(): void {
    // Cleanup event listeners
    EventBus.off('start-game', this.startGame.bind(this));
    super.destroy();
  }
}
