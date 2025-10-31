<script lang="ts">
  import { onMount } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  // Available symbols for the safe puzzle (matching the 3x3 grid on safe image)
  // Row 1: Triangle, Square, Circle
  // Row 2: Star, Diamond, Hexagon
  // Row 3: X, Spiral (@), Waves
  const SYMBOLS = ['▲', '■', '●', '★', '◆', '⬢', '×', '@', '≈'];

  // Correct sequence (TODO: Get from game design)
  const CORRECT_SEQUENCE = ['●', '▲', '■', '★'];

  let isVisible = $state(false);
  let sequence: string[] = $state([]);
  let errorMessage = $state('');
  let isShaking = $state(false);

  /**
   * Show the safe puzzle
   */
  function showSafe() {
    isVisible = true;
    sequence = [];
    errorMessage = '';
    console.log('[Safe] Showing safe puzzle');
  }

  /**
   * Close the safe puzzle
   */
  function closeSafe() {
    isVisible = false;
    console.log('[Safe] Closing safe puzzle');
  }

  /**
   * Add a symbol to the sequence
   */
  function addSymbol(symbol: string) {
    if (sequence.length < CORRECT_SEQUENCE.length) {
      sequence = [...sequence, symbol];
      errorMessage = '';
    }
  }

  /**
   * Remove the last symbol from sequence
   */
  function removeLastSymbol() {
    if (sequence.length > 0) {
      sequence = sequence.slice(0, -1);
      errorMessage = '';
    }
  }

  /**
   * Clear all symbols
   */
  function clearSequence() {
    sequence = [];
    errorMessage = '';
  }

  /**
   * Check if the sequence is correct
   */
  function checkSequence() {
    if (sequence.length !== CORRECT_SEQUENCE.length) {
      errorMessage = `Digite ${CORRECT_SEQUENCE.length} símbolos`;
      triggerShake();
      return;
    }

    const isCorrect = sequence.every((symbol, index) => symbol === CORRECT_SEQUENCE[index]);

    if (isCorrect) {
      console.log('[Safe] Correct sequence! Unlocking...');
      errorMessage = '';

      // Close the safe UI
      closeSafe();

      // Emit event to BathroomScene
      EventBus.emit('safe-unlocked');
    } else {
      console.log('[Safe] Incorrect sequence');
      errorMessage = 'Sequência incorreta! Tente novamente.';
      triggerShake();
      // Don't clear the sequence - let player try again
    }
  }

  /**
   * Trigger shake animation
   */
  function triggerShake() {
    isShaking = true;
    setTimeout(() => {
      isShaking = false;
    }, 500);
  }

  /**
   * Handle ESC key to close
   */
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isVisible) {
      closeSafe();
    }
  }

  onMount(() => {
    EventBus.on('show-safe', showSafe);

    return () => {
      EventBus.off('show-safe', showSafe);
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isVisible}
  <div class="safe-overlay" onclick={closeSafe}>
    <div class="safe-container" class:shake={isShaking} onclick={(e) => e.stopPropagation()}>
      <!-- Close button -->
      <button class="close-button" onclick={closeSafe} aria-label="Fechar">
        ✕
      </button>

      <!-- Safe image -->
      <div class="safe-image-container">
        <img
          src="/assets/images/sprites/safe_closeup.png"
          alt="Cofre"
          class="safe-image"
        />
      </div>

      <!-- Sequence display -->
      <div class="sequence-display">
        {#each Array(CORRECT_SEQUENCE.length) as _, index}
          <div class="sequence-slot">
            {#if sequence[index]}
              <span class="symbol">{sequence[index]}</span>
            {:else}
              <span class="placeholder">?</span>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Error message -->
      {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
      {/if}

      <!-- Puzzle input area: symbol grid + control buttons side by side -->
      <div class="puzzle-input-area">
        <!-- Symbol buttons -->
        <div class="symbol-buttons">
          {#each SYMBOLS as symbol}
            <button
              class="symbol-button"
              onclick={() => addSymbol(symbol)}
              disabled={sequence.length >= CORRECT_SEQUENCE.length}
              aria-label={`Adicionar símbolo ${symbol}`}
            >
              {symbol}
            </button>
          {/each}
        </div>

        <!-- Control buttons (vertical, right side) -->
        <div class="control-buttons">
          <button class="control-button remove" onclick={removeLastSymbol} aria-label="Remover último">
            ← Remover
          </button>
          <button class="control-button clear" onclick={clearSequence} aria-label="Limpar tudo">
            Limpar
          </button>
          <button class="control-button confirm" onclick={checkSequence} aria-label="Confirmar">
            Confirmar
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <p class="instructions">Digite a sequência correta de símbolos para abrir o cofre</p>
    </div>
  </div>
{/if}

<style>
  .safe-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .safe-container {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 30px;
    background: linear-gradient(135deg, #1a0a23 0%, #2a1a33 100%);
    border: 4px solid #ff5e00;
    border-radius: 16px;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.8),
      0 0 30px rgba(255, 94, 0, 0.5);
    animation: scaleIn 0.3s ease;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .safe-container.shake {
    animation: shake 0.5s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }

  .safe-title {
    font-size: 28px;
    font-weight: 900;
    font-family: 'Arial Black', 'Arial Bold', 'Gadget', sans-serif;
    color: #ff5e00;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-shadow:
      0 0 20px rgba(255, 94, 0, 1),
      0 0 40px rgba(255, 94, 0, 0.8);
    margin: 0;
  }

  .safe-image-container {
    position: relative;
    max-width: 100%;
    max-height: 40vh;
  }

  .safe-image {
    max-width: 100%;
    max-height: 40vh;
    height: auto;
    border: 3px solid #ff5e00;
    border-radius: 8px;
    box-shadow:
      0 5px 20px rgba(0, 0, 0, 0.6),
      0 0 15px rgba(255, 94, 0, 0.3);
  }

  .sequence-display {
    display: flex;
    gap: 15px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 94, 0, 0.6);
    border-radius: 12px;
  }

  .sequence-slot {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2a1a33 0%, #1a0a23 100%);
    border: 2px solid #ff5e00;
    border-radius: 8px;
    font-size: 32px;
    font-weight: bold;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .sequence-slot .symbol {
    color: #ff5e00;
    text-shadow: 0 0 10px rgba(255, 94, 0, 0.8);
  }

  .sequence-slot .placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .error-message {
    color: #ff3333;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    margin: 0;
    text-shadow:
      0 0 10px rgba(255, 51, 51, 0.8),
      0 2px 4px rgba(0, 0, 0, 0.8);
  }

  .puzzle-input-area {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;
  }

  .symbol-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    max-width: 210px;
  }

  .symbol-button {
    width: 60px;
    height: 60px;
    font-size: 32px;
    background: linear-gradient(135deg, #ff5e00 0%, #ff8533 100%);
    border: 2px solid #ff5e00;
    color: white;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(255, 94, 0, 0.4);
  }

  .symbol-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff7a33 0%, #ffa366 100%);
    border-color: #ffa366;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255, 94, 0, 0.6);
  }

  .symbol-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .symbol-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .control-button {
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    font-family: 'Arial', sans-serif;
    border: 2px solid;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .control-button.remove {
    background: linear-gradient(135deg, #8a0a0a 0%, #aa1a1a 100%);
    border-color: #cc3333;
    color: white;
    box-shadow: 0 4px 10px rgba(204, 51, 51, 0.4);
  }

  .control-button.remove:hover {
    background: linear-gradient(135deg, #aa1a1a 0%, #cc3333 100%);
    border-color: #ee5555;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(204, 51, 51, 0.6);
  }

  .control-button.clear {
    background: linear-gradient(135deg, #4a0a5a 0%, #6a1a7a 100%);
    border-color: #8a2aba;
    color: white;
    box-shadow: 0 4px 10px rgba(138, 42, 186, 0.4);
  }

  .control-button.clear:hover {
    background: linear-gradient(135deg, #6a1a7a 0%, #8a2aba 100%);
    border-color: #aa4ada;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(138, 42, 186, 0.6);
  }

  .control-button.confirm {
    background: linear-gradient(135deg, #0a7a0a 0%, #1aaa1a 100%);
    border-color: #33cc33;
    color: white;
    box-shadow: 0 4px 10px rgba(51, 204, 51, 0.4);
  }

  .control-button.confirm:hover {
    background: linear-gradient(135deg, #1aaa1a 0%, #33cc33 100%);
    border-color: #55ee55;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(51, 204, 51, 0.6);
  }

  .control-button:active {
    transform: translateY(0);
  }

  .close-button {
    position: absolute;
    top: -15px;
    right: -15px;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ff5e00 0%, #ff8533 100%);
    border: 2px solid #ff5e00;
    color: white;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(255, 94, 0, 0.4);
  }

  .close-button:hover {
    background: linear-gradient(135deg, #ff7a33 0%, #ffa366 100%);
    transform: scale(1.1);
    box-shadow: 0 6px 15px rgba(255, 94, 0, 0.6);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .instructions {
    color: #ffffff;
    font-size: 14px;
    text-align: center;
    opacity: 0.7;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    max-width: 400px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .safe-container {
      padding: 20px;
      gap: 15px;
    }

    .safe-title {
      font-size: 22px;
      letter-spacing: 2px;
    }

    .safe-image {
      max-height: 30vh;
    }

    .sequence-slot {
      width: 50px;
      height: 50px;
      font-size: 28px;
    }

    .puzzle-input-area {
      flex-direction: column;
      gap: 15px;
    }

    .symbol-button {
      width: 50px;
      height: 50px;
      font-size: 28px;
    }

    .control-buttons {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
    }

    .control-button {
      padding: 10px 20px;
      font-size: 14px;
    }

    .instructions {
      font-size: 12px;
    }
  }
</style>
