<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../game/EventBus';
  import { isGameOver } from './stores';
  import GUI from './components/GUI.svelte';
  import GameOver from './components/GameOver.svelte';
  import Quiz from './components/Quiz.svelte';
  import { initializeGame } from '../game/Game';

  let showMainMenu = $state(false);

  function handleShowMainMenu() {
    showMainMenu = true;
  }

  function handleHideMainMenu() {
    showMainMenu = false;
  }

  function startGame() {
    EventBus.emit('start-game');
  }

  onMount(() => {
    // Initialize Phaser game after DOM is ready
    const game = initializeGame();

    // Listen for events from Phaser
    EventBus.on('show-main-menu', handleShowMainMenu);
    EventBus.on('hide-main-menu', handleHideMainMenu);

    return () => {
      EventBus.off('show-main-menu', handleShowMainMenu);
      EventBus.off('hide-main-menu', handleHideMainMenu);
      game?.destroy(true);
    };
  });
</script>

<!-- Game GUI - Always rendered -->
<GUI />

<!-- Quiz Component - Shows when triggered by EventBus -->
<Quiz />

{#if $isGameOver}
  <!-- Game Over Screen -->
  <GameOver />
{:else if showMainMenu}
  <!-- Main Menu Overlay -->
  <div class="main-menu-overlay">
    <div class="menu-content">
      <h1 class="game-title">Halloween Anniversary</h1>
      <button
        onclick={startGame}
        class="start-button"
      >
        Start Game
      </button>
    </div>
  </div>
{/if}

<style>
  /* Global body background - Halloween theme */
  :global(body) {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #1a0a2e 0%, #0f051d 100%);
    overflow: hidden;
    font-family: 'Arial Black', 'Arial Bold', Gadget, sans-serif;
  }

  /* Halloween background decorations */
  :global(body::before) {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(2px 2px at 60% 70%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(1px 1px at 80% 10%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(2px 2px at 90% 60%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(1px 1px at 33% 50%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(2px 2px at 79% 53%, rgba(255, 255, 255, 0.1), transparent);
    background-size: 200% 200%;
    animation: sparkle 8s ease-in-out infinite;
    pointer-events: none;
    opacity: 0.5;
    z-index: 0;
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }

  .main-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, rgba(26, 10, 46, 0.95) 0%, rgba(15, 5, 29, 0.95) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .menu-content {
    text-align: center;
  }

  .game-title {
    font-size: 48px;
    font-weight: bold;
    color: #ff6b35;
    margin-bottom: 32px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .start-button {
    padding: 16px 48px;
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    background-color: #ff6b35;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .start-button:hover {
    background-color: #ff8c5a;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }

  .start-button:active {
    transform: translateY(0);
  }
</style>
