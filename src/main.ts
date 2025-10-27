import 'uno.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';
import { initializeGame } from './game/Game';

// Initialize Svelte UI using Svelte 5 API
const app = mount(App, {
  target: document.getElementById('app')!
});

// Initialize Phaser game
const game = initializeGame();

export default app;
