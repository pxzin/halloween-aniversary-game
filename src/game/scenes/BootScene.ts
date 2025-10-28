import Phaser from 'phaser';
import { DialogueManager } from '../services/DialogueManager';

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
    // Check for dev scene skip
    const startScene = sessionStorage.getItem('startScene');
    console.log('BootScene - startScene from sessionStorage:', startScene);

    if (startScene) {
      // Clear the session storage
      sessionStorage.removeItem('startScene');

      // Clear DialogueManager state to prevent stale dialogues
      DialogueManager.clear();

      console.log('Starting scene:', startScene);
      // Start the specified scene
      this.scene.start(startScene);
    } else {
      // Normal flow: start with IntroScene
      console.log('Starting default scene: IntroScene');
      this.scene.start('IntroScene');
    }
  }
}
