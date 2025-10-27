import 'uno.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';
import { gameTime, isGameOver } from './ui/stores';
import { EventBus } from './game/EventBus';
import type { GameTime } from './ui/stores';
import { get } from 'svelte/store';

// Initialize Svelte UI using Svelte 5 API
const app = mount(App, {
  target: document.getElementById('app')!
});

// Game clock timer reference
let clockTimer: number | null = null;

/**
 * Start the game clock
 */
function startGameClock() {
  // Clear any existing timer
  if (clockTimer !== null) {
    clearInterval(clockTimer);
  }

  // Game clock timer - increments every second (1 real second = 1 in-game second)
  clockTimer = setInterval(() => {
    const currentTime = get(gameTime);

    // Increment second
    let newSecond = currentTime.second + 1;
    let newMinute = currentTime.minute;
    let newHour = currentTime.hour;

    // Handle second rollover
    if (newSecond >= 60) {
      newSecond = 0;
      newMinute += 1;
    }

    // Handle minute rollover
    if (newMinute >= 60) {
      newMinute = 0;
      newHour = (newHour + 1) % 24;
    }

    // Check for midnight (game over condition)
    if (newHour === 0 && newMinute === 0 && newSecond === 0) {
      if (clockTimer !== null) {
        clearInterval(clockTimer);
      }
      isGameOver.set(true);
      return;
    }

    // Update time
    gameTime.set({ hour: newHour, minute: newMinute, second: newSecond });
  }, 1000);
}

// Listen for start-game event to begin the clock
EventBus.on('start-game', startGameClock);

export default app;
