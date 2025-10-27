<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../game/EventBus';
  import { isGameOver } from './stores';
  import GUI from './components/GUI.svelte';
  import GameOver from './components/GameOver.svelte';

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
    // Listen for events from Phaser
    EventBus.on('show-main-menu', handleShowMainMenu);
    EventBus.on('hide-main-menu', handleHideMainMenu);
  });

  onDestroy(() => {
    // Cleanup event listeners
    EventBus.off('show-main-menu', handleShowMainMenu);
    EventBus.off('hide-main-menu', handleHideMainMenu);
  });
</script>

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
{:else}
  <!-- Game GUI -->
  <GUI />
{/if}

<style>
  .main-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
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
