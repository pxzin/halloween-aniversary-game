<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  // Choice state
  let isActive = $state(false);
  let question = $state('');
  let choices = $state<string[]>([]);
  let hoveredIndex = $state<number | null>(null);

  /**
   * Show choice dialogue
   */
  function showChoices(data: { question: string; choices: string[] }) {
    question = data.question;
    choices = data.choices;
    isActive = true;
    console.log('[ChoiceBox] Showing choices:', data);
  }

  /**
   * Handle choice selection
   */
  function selectChoice(index: number) {
    console.log('[ChoiceBox] Choice selected:', index);

    // Emit event with selected choice
    EventBus.emit('choice-made', { choiceIndex: index });

    // Hide choice box
    isActive = false;
    hoveredIndex = null;
  }

  // Listen for show-choices event
  onMount(() => {
    EventBus.on('show-choices', showChoices);
    console.log('[ChoiceBox] Mounted and listening for show-choices');
  });

  onDestroy(() => {
    EventBus.off('show-choices', showChoices);
    console.log('[ChoiceBox] Destroyed');
  });
</script>

{#if isActive}
  <div class="choice-overlay">
    <div class="choice-box">
      <!-- Question -->
      <div class="choice-question">
        {question}
      </div>

      <!-- Choices -->
      <div class="choice-list">
        {#each choices as choice, index}
          <button
            class="choice-button"
            class:hovered={hoveredIndex === index}
            onmouseenter={() => hoveredIndex = index}
            onmouseleave={() => hoveredIndex = null}
            onclick={() => selectChoice(index)}
          >
            <span class="choice-number">{index + 1}</span>
            <span class="choice-text">{choice}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .choice-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
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

  .choice-box {
    background: linear-gradient(135deg, #1a0033 0%, #330066 100%);
    border: 4px solid #ff6600;
    border-radius: 20px;
    padding: 40px;
    max-width: 600px;
    width: 90%;
    box-shadow:
      0 10px 40px rgba(255, 102, 0, 0.4),
      0 0 60px rgba(255, 102, 0, 0.2),
      inset 0 2px 10px rgba(255, 255, 255, 0.1);
    animation: slideUp 0.4s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .choice-question {
    font-family: 'Arial Black', sans-serif;
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
    margin-bottom: 30px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  }

  .choice-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .choice-button {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 20px;
    background: linear-gradient(135deg, #2a0055 0%, #4a0088 100%);
    border: 3px solid #8a2aba;
    border-radius: 10px;
    color: #ffffff;
    font-family: 'Arial', sans-serif;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
      0 4px 15px rgba(138, 42, 186, 0.3),
      inset 0 -2px 5px rgba(0, 0, 0, 0.3);
  }

  .choice-button:hover,
  .choice-button.hovered {
    background: linear-gradient(135deg, #4a0088 0%, #6a10aa 100%);
    border-color: #aa4ada;
    transform: translateX(10px) scale(1.02);
    box-shadow:
      0 6px 25px rgba(138, 42, 186, 0.5),
      0 0 30px rgba(255, 102, 0, 0.3),
      inset 0 -2px 5px rgba(0, 0, 0, 0.3);
  }

  .choice-button:active {
    transform: translateX(10px) scale(0.98);
  }

  .choice-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    background: linear-gradient(135deg, #ff6600 0%, #ff8833 100%);
    border: 2px solid #ffaa66;
    border-radius: 50%;
    font-size: 18px;
    font-weight: 900;
    flex-shrink: 0;
    box-shadow:
      0 2px 10px rgba(255, 102, 0, 0.5),
      inset 0 1px 3px rgba(255, 255, 255, 0.3);
  }

  .choice-text {
    flex: 1;
    text-align: left;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  /* Responsive */
  @media (max-width: 600px) {
    .choice-box {
      padding: 30px 20px;
    }

    .choice-question {
      font-size: 20px;
    }

    .choice-button {
      padding: 12px 15px;
      font-size: 16px;
    }

    .choice-number {
      width: 30px;
      height: 30px;
      font-size: 16px;
    }
  }
</style>
