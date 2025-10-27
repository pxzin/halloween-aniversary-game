import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { WorldScene } from './scenes/WorldScene';

// Phaser game configuration with registered scenes
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  scene: [BootScene, MainMenuScene, WorldScene]
};

// Export a function to initialize the game when needed
export function initializeGame(): Phaser.Game {
  return new Phaser.Game(config);
}
