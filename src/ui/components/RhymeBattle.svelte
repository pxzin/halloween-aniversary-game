<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  let isVisible = $state(false);
  let currentRound = $state(0);
  let selectedChoice = $state<string | null>(null);
  let showResult = $state(false);
  let isCorrect = $state(false);

  // 5 rounds of rhyme battle
  // Each round has the owl's line and 3 possible responses (only 1 is correct)
  const rounds = [
    {
      owlLine: "Eu sou a coruja, o terror da lição...",
      choices: [
        { id: 'a', text: "...e eu vou te mandar de volta pro chão!", correct: false },
        { id: 'b', text: "...e eu vou te chutar pra outra dimensão!", correct: true },
        { id: 'c', text: "...e você não passa dessa missão!", correct: false }
      ]
    },
    {
      owlLine: "Sua alma é minha, não tem pra onde correr...",
      choices: [
        { id: 'a', text: "...mas com meus presentes, eu vou te vencer!", correct: true },
        { id: 'b', text: "...mas sua maldição vai desaparecer!", correct: false },
        { id: 'c', text: "...mas vou te derrotar antes do amanhecer!", correct: false }
      ]
    },
    {
      owlLine: "Comida, bebida, e um novo celular...",
      choices: [
        { id: 'a', text: "...são coisas que você nunca vai ganhar!", correct: false },
        { id: 'b', text: "...vão fazer você se transformar!", correct: false },
        { id: 'c', text: "...são as oferendas que vão te derrotar!", correct: true }
      ]
    },
    {
      owlLine: "Você é só uma, não pode me vencer...",
      choices: [
        { id: 'a', text: "...mas vou lutar até o sol nascer!", correct: false },
        { id: 'b', text: "...mas com meu amor, eu tenho mais poder!", correct: true },
        { id: 'c', text: "...mas sua derrota está prestes a acontecer!", correct: false }
      ]
    },
    {
      owlLine: "Chega de rimas, sua garota insolente!",
      choices: [
        { id: 'a', text: "...mas eu sou forte e persistente!", correct: false },
        { id: 'b', text: "...seu poder é insignificante!", correct: false },
        { id: 'c', text: "...com a minha magia, quebro sua corrente!", correct: true }
      ]
    }
  ];

  let failedRounds = 0;
  const MAX_FAILURES = 2; // Player can fail up to 2 rounds

  function startBattle() {
    console.log('[RhymeBattle] Starting rhyme battle');
    isVisible = true;
    currentRound = 0;
    failedRounds = 0;
    selectedChoice = null;
    showResult = false;
  }

  function selectChoice(choiceId: string) {
    if (showResult) return; // Prevent selection during result display
    selectedChoice = choiceId;
  }

  function confirmChoice() {
    if (!selectedChoice || showResult) return;

    const round = rounds[currentRound];
    const choice = round.choices.find(c => c.id === selectedChoice);

    if (!choice) return;

    isCorrect = choice.correct;
    showResult = true;

    if (!isCorrect) {
      failedRounds++;
    }

    // Wait before moving to next round
    setTimeout(() => {
      if (currentRound < rounds.length - 1) {
        // Next round
        currentRound++;
        selectedChoice = null;
        showResult = false;
        isCorrect = false;
      } else {
        // Battle finished
        finishBattle();
      }
    }, 2000);
  }

  function finishBattle() {
    console.log('[RhymeBattle] Battle finished. Failed rounds:', failedRounds);
    isVisible = false;

    // Emit result (success if failed less than max failures)
    const success = failedRounds < MAX_FAILURES;
    EventBus.emit('rhyme-battle-completed', success);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isVisible || showResult) return;

    // Allow keyboard selection: 1, 2, 3 or A, B, C
    const keyMap: { [key: string]: string } = {
      '1': 'a', 'a': 'a',
      '2': 'b', 'b': 'b',
      '3': 'c', 'c': 'c'
    };

    const choiceId = keyMap[event.key.toLowerCase()];
    if (choiceId) {
      selectChoice(choiceId);
    }

    // Enter to confirm
    if (event.key === 'Enter') {
      confirmChoice();
    }
  }

  onMount(() => {
    EventBus.on('start-rhyme-battle', startBattle);
  });

  onDestroy(() => {
    EventBus.off('start-rhyme-battle', startBattle);
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isVisible}
  <div class="rhyme-battle-overlay">
    <div class="rhyme-battle-container">
      <!-- Header -->
      <div class="battle-header">
        <h2 class="battle-title">⚔️ Duelo de Rimas ⚔️</h2>
        <div class="round-indicator">
          Rodada {currentRound + 1} de {rounds.length}
        </div>
        <div class="lives-indicator">
          Erros: {failedRounds} / {MAX_FAILURES}
        </div>
      </div>

      <!-- Owl's Line -->
      <div class="owl-section">
        <div class="character-label owl">🦉 Coruja Demoníaca</div>
        <div class="dialogue-bubble owl-bubble">
          {rounds[currentRound].owlLine}
        </div>
      </div>

      <!-- Jessica's Response Choices -->
      <div class="jessica-section">
        <div class="character-label jessica">💜 Jessica</div>

        {#if !showResult}
          <div class="choices-container">
            {#each rounds[currentRound].choices as choice, index}
              <button
                class="choice-button"
                class:selected={selectedChoice === choice.id}
                onclick={() => selectChoice(choice.id)}
              >
                <span class="choice-key">{index + 1}</span>
                <span class="choice-text">{choice.text}</span>
              </button>
            {/each}
          </div>

          <button
            class="confirm-button"
            class:disabled={!selectedChoice}
            onclick={confirmChoice}
            disabled={!selectedChoice}
          >
            Confirmar Resposta
          </button>
        {:else}
          <!-- Show result -->
          <div class="result-container" class:correct={isCorrect} class:incorrect={!isCorrect}>
            {#if isCorrect}
              <div class="result-icon">✓</div>
              <div class="result-text">Perfeito! Rima correta!</div>
            {:else}
              <div class="result-icon">✗</div>
              <div class="result-text">Essa não rimou bem...</div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .rhyme-battle-overlay {
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
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .rhyme-battle-container {
    width: 90%;
    max-width: 800px;
    padding: 30px;
    background: linear-gradient(135deg, #1a0a2e 0%, #16213e 100%);
    border: 3px solid #8a2be2;
    border-radius: 20px;
    box-shadow: 0 0 50px rgba(138, 43, 226, 0.6);
  }

  .battle-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .battle-title {
    font-size: 32px;
    font-weight: 900;
    color: #ff5e00;
    text-shadow: 0 0 20px rgba(255, 94, 0, 0.8);
    margin: 0 0 15px 0;
  }

  .round-indicator {
    font-size: 18px;
    color: #ffffff;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .lives-indicator {
    font-size: 16px;
    color: #ff6b6b;
    font-weight: bold;
  }

  .owl-section,
  .jessica-section {
    margin-bottom: 30px;
  }

  .character-label {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
  }

  .character-label.owl {
    color: #ff6b6b;
    text-shadow: 0 0 10px rgba(255, 107, 107, 0.6);
  }

  .character-label.jessica {
    color: #a78bfa;
    text-shadow: 0 0 10px rgba(167, 139, 250, 0.6);
  }

  .dialogue-bubble {
    padding: 20px;
    border-radius: 15px;
    font-size: 18px;
    line-height: 1.6;
    text-align: center;
    font-weight: 500;
  }

  .owl-bubble {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(139, 0, 0, 0.3) 100%);
    border: 2px solid #ff6b6b;
    color: #fff;
  }

  .choices-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }

  .choice-button {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 20px;
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(75, 0, 130, 0.3) 100%);
    border: 2px solid #8a2be2;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .choice-button:hover {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(75, 0, 130, 0.5) 100%);
    border-color: #a78bfa;
    transform: translateX(5px);
  }

  .choice-button.selected {
    background: linear-gradient(135deg, rgba(255, 94, 0, 0.4) 0%, rgba(255, 140, 0, 0.5) 100%);
    border-color: #ff5e00;
    box-shadow: 0 0 20px rgba(255, 94, 0, 0.6);
  }

  .choice-key {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 5px;
    font-weight: bold;
    font-size: 14px;
    flex-shrink: 0;
  }

  .choice-text {
    flex: 1;
  }

  .confirm-button {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #ff5e00 0%, #ff8533 100%);
    border: 2px solid #ff5e00;
    border-radius: 10px;
    color: white;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
  }

  .confirm-button:hover:not(.disabled) {
    background: linear-gradient(135deg, #ff7a33 0%, #ffa366 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(255, 94, 0, 0.6);
  }

  .confirm-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .result-container {
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    animation: scaleIn 0.3s ease-out;
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

  .result-container.correct {
    background: linear-gradient(135deg, rgba(88, 204, 2, 0.3) 0%, rgba(0, 128, 0, 0.4) 100%);
    border: 2px solid #58cc02;
  }

  .result-container.incorrect {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.3) 0%, rgba(139, 0, 0, 0.4) 100%);
    border: 2px solid #ff6b6b;
  }

  .result-icon {
    font-size: 48px;
    margin-bottom: 10px;
  }

  .result-text {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .rhyme-battle-container {
      width: 95%;
      padding: 20px;
    }

    .battle-title {
      font-size: 24px;
    }

    .dialogue-bubble {
      font-size: 16px;
      padding: 15px;
    }

    .choice-button {
      font-size: 14px;
      padding: 12px 15px;
    }
  }
</style>
