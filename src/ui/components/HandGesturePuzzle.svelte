<script lang="ts">
  import { onMount } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  // Available hand gesture emojis (6 options to make it more challenging)
  const BASE_GESTURES = ['🤌', '🫰', '😘', '🤟', '✌️', '👌'];

  // Required gestures (order doesn't matter, just need to contain all 3)
  const REQUIRED_GESTURES = ['🤌', '🫰', '😘'];
  const REQUIRED_COUNT = 3;

  let isVisible = $state(false);
  let sequence: string[] = $state([]);
  let errorMessage = $state('');
  let isShaking = $state(false);
  let shuffledGestures = $state<string[]>([]);

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Show the hand gesture puzzle
   */
  function showPuzzle() {
    isVisible = true;
    sequence = [];
    errorMessage = '';
    shuffledGestures = shuffleArray(BASE_GESTURES);
    console.log('[HandGesturePuzzle] Showing puzzle with shuffled gestures:', shuffledGestures);
  }

  /**
   * Close the puzzle
   */
  function closePuzzle() {
    isVisible = false;
    console.log('[HandGesturePuzzle] Closing puzzle');
  }

  /**
   * Add a gesture to the sequence
   */
  function addGesture(gesture: string) {
    if (sequence.length < REQUIRED_COUNT) {
      sequence = [...sequence, gesture];
      errorMessage = '';

      // Auto-check when sequence is complete
      if (sequence.length === REQUIRED_COUNT) {
        checkSequence();
      }
    }
  }

  /**
   * Clear all gestures
   */
  function clearSequence() {
    sequence = [];
    errorMessage = '';
  }

  /**
   * Check if the sequence contains all required gestures
   */
  function checkSequence() {
    if (sequence.length !== REQUIRED_COUNT) {
      errorMessage = `Faça ${REQUIRED_COUNT} gestos`;
      triggerShake();
      return;
    }

    // Check if sequence contains all required gestures (order doesn't matter)
    const hasAllRequired = REQUIRED_GESTURES.every(requiredGesture =>
      sequence.includes(requiredGesture)
    );

    if (hasAllRequired) {
      console.log('[HandGesturePuzzle] Correct combination! Unlocking...', sequence);
      errorMessage = '';

      // Close the puzzle UI
      closePuzzle();

      // Emit event to BedroomScene
      EventBus.emit('wardrobe-unlocked');
    } else {
      console.log('[HandGesturePuzzle] Incorrect combination:', sequence);
      errorMessage = 'Combinação incorreta! Tente novamente.';
      triggerShake();
      // Clear the sequence to try again
      setTimeout(() => {
        sequence = [];
        errorMessage = '';
      }, 1000);
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
      closePuzzle();
    }
  }

  onMount(() => {
    EventBus.on('show-hand-gesture-puzzle', showPuzzle);

    return () => {
      EventBus.off('show-hand-gesture-puzzle', showPuzzle);
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isVisible}
  <div class="puzzle-overlay" onclick={closePuzzle}>
    <div class="puzzle-container" class:shake={isShaking} onclick={(e) => e.stopPropagation()}>
      <!-- Close button -->
      <button class="close-button" onclick={closePuzzle} aria-label="Fechar">
        ✕
      </button>

      <!-- Title -->
      <h2 class="puzzle-title">Painel do Guarda-roupa</h2>

      <!-- Wardrobe panel image placeholder -->
      <div class="panel-description">
        <p>Um painel com três botões estranhos...</p>
      </div>

      <!-- Sequence display -->
      <div class="sequence-display">
        {#each Array(REQUIRED_COUNT) as _, index}
          <div class="sequence-slot">
            {#if sequence[index]}
              <span class="gesture">{sequence[index]}</span>
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

      <!-- Gesture buttons (shuffled) -->
      <div class="gesture-buttons">
        {#each shuffledGestures as gesture}
          <button
            class="gesture-button"
            onclick={() => addGesture(gesture)}
            aria-label={`Fazer gesto ${gesture}`}
          >
            {gesture}
          </button>
        {/each}
      </div>

      <!-- Control buttons -->
      <div class="control-buttons">
        <button class="control-button clear" onclick={clearSequence} aria-label="Limpar">
          Limpar
        </button>
      </div>

      <!-- Instructions -->
      <p class="instructions">Faça a sequência correta de gestos para abrir o guarda-roupa</p>
    </div>
  </div>
{/if}

<style>
  .puzzle-overlay {
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

  .puzzle-container {
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

  .puzzle-container.shake {
    animation: shake 0.5s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }

  .puzzle-title {
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

  .panel-description {
    text-align: center;
    color: #ffffff;
    font-size: 16px;
    opacity: 0.8;
    margin: 0;
  }

  .panel-description p {
    margin: 0;
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
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2a1a33 0%, #1a0a23 100%);
    border: 2px solid #ff5e00;
    border-radius: 8px;
    font-size: 48px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .sequence-slot .gesture {
    color: #ff5e00;
    text-shadow: 0 0 10px rgba(255, 94, 0, 0.8);
  }

  .sequence-slot .placeholder {
    color: rgba(255, 255, 255, 0.3);
    font-size: 32px;
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

  .gesture-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    max-width: 270px;
  }

  .gesture-button {
    width: 80px;
    height: 80px;
    font-size: 48px;
    background: linear-gradient(135deg, #ff5e00 0%, #ff8533 100%);
    border: 2px solid #ff5e00;
    color: white;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(255, 94, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gesture-button:hover {
    background: linear-gradient(135deg, #ff7a33 0%, #ffa366 100%);
    border-color: #ffa366;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255, 94, 0, 0.6);
  }

  .gesture-button:active {
    transform: translateY(0);
  }

  .control-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
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
    .puzzle-container {
      padding: 20px;
      gap: 15px;
    }

    .puzzle-title {
      font-size: 22px;
      letter-spacing: 2px;
    }

    .sequence-slot {
      width: 60px;
      height: 60px;
      font-size: 40px;
    }

    .gesture-button {
      width: 70px;
      height: 70px;
      font-size: 42px;
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
