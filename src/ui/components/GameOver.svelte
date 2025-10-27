<script lang="ts">
  import { gameTime, inventory, dialogue, selectedItem, combinationStore, isGameOver, INITIAL_TIME } from '../stores';

  /**
   * Restart the game
   */
  function restartGame() {
    // Reset all stores to initial state
    gameTime.set({ ...INITIAL_TIME });
    inventory.set([]);
    dialogue.set(null);
    selectedItem.set(null);
    combinationStore.set(null);
    isGameOver.set(false);

    // Reload the page to restart Phaser
    window.location.reload();
  }
</script>

<div class="game-over-overlay">
  <div class="game-over-content">
    <h1 class="game-over-title">Meia-Noite!</h1>
    <p class="game-over-text">
      O tempo acabou... A maldição do Duolingo prevaleceu!
    </p>
    <div class="owl-icon">🦉</div>
    <button onclick={restartGame} class="restart-button">
      Tentar Novamente
    </button>
  </div>
</div>

<style>
  .game-over-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .game-over-content {
    text-align: center;
    max-width: 500px;
    padding: 40px;
  }

  .game-over-title {
    font-size: 64px;
    font-weight: bold;
    color: #ff0000;
    margin-bottom: 24px;
    text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .game-over-text {
    font-size: 20px;
    color: #ffffff;
    margin-bottom: 32px;
    line-height: 1.6;
  }

  .owl-icon {
    font-size: 80px;
    margin-bottom: 32px;
    animation: shake 1s infinite;
  }

  @keyframes shake {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-10deg);
    }
    75% {
      transform: rotate(10deg);
    }
  }

  .restart-button {
    padding: 16px 48px;
    font-size: 20px;
    font-weight: bold;
    color: #ffffff;
    background-color: #ff6b35;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .restart-button:hover {
    background-color: #ff8c5a;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }

  .restart-button:active {
    transform: translateY(0);
  }
</style>
