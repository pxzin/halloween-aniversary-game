<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../game/EventBus';

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

<main class="p-4">
  <h1 class="text-2xl font-bold text-orange-500">Halloween Anniversary</h1>

  {#if showMainMenu}
    <div class="mt-4">
      <button
        onclick={startGame}
        class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
      >
        Start Game
      </button>
    </div>
  {/if}
</main>

<style>
  /* Component-specific styles can go here */
</style>
