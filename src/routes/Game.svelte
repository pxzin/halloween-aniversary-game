<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { EventBus } from '../game/EventBus';
  import { gameTime, isGameOver } from '../ui/stores';
  import { get } from 'svelte/store';
  import GUI from '../ui/components/GUI.svelte';
  import GameOver from '../ui/components/GameOver.svelte';
  import Quiz from '../ui/components/Quiz.svelte';
  import Padlock from '../ui/components/Padlock.svelte';
  import MousePositionDebug from '../ui/components/MousePositionDebug.svelte';
  import { initializeGame } from '../game/Game';

  function goToHome() {
    push('/');
  }

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

  onMount(() => {
    // Initialize Phaser game after DOM is ready
    // Note: Scene skip is handled via sessionStorage set in Home.svelte
    const game = initializeGame();

    // Start game clock when quiz is completed
    EventBus.on('quiz-completed', startGameClock);

    return () => {
      // Cleanup
      EventBus.off('quiz-completed', startGameClock);
      if (clockTimer !== null) {
        clearInterval(clockTimer);
      }
      game?.destroy(true);
    };
  });
</script>

<!-- Logo fixo no topo -->
<img
  src="/assets/images/ui/logo_transparent.png"
  alt="Logo"
  class="game-logo"
  onclick={goToHome}
/>

<!-- Game GUI - Always rendered -->
<GUI />

<!-- Quiz Component - Shows when triggered by EventBus -->
<Quiz />

<!-- Padlock Component - Shows when triggered by EventBus -->
<Padlock />

<!-- Mouse Position Debug - Dev only -->
<MousePositionDebug />

{#if $isGameOver}
  <!-- Game Over Screen -->
  <GameOver />
{/if}

<style>
  .game-logo {
    position: fixed;
    /* top: 10px; */
    left: 50%;
    transform: translateX(-50%);
    height: 10vh;
    width: auto;
    object-fit: contain;
    z-index: 9999;
    cursor: pointer;
  }
</style>
