import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { IntroScene } from './scenes/IntroScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { WorldScene } from './scenes/WorldScene';
import { FachadaScene } from './scenes/FachadaScene';
import { StairsScene } from './scenes/StairsScene';
import { BalconyScene } from './scenes/BalconyScene';

// Phaser game configuration with registered scenes
// Using 16:9 aspect ratio (1280x720)
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, IntroScene, MainMenuScene, FachadaScene, StairsScene, BalconyScene, WorldScene]
};

// Export a function to initialize the game when needed
export function initializeGame(): Phaser.Game {
  return new Phaser.Game(config);
}
