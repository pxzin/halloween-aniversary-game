import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { IntroScene } from './scenes/IntroScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { WorldScene } from './scenes/WorldScene';

// Phaser game configuration with registered scenes
// Using 16:9 aspect ratio (1280x720)
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',
  scene: [BootScene, IntroScene, MainMenuScene, WorldScene]
};

// Export a function to initialize the game when needed
export function initializeGame(): Phaser.Game {
  return new Phaser.Game(config);
}
