<script lang="ts">
  import { EventBus } from '../../game/EventBus';
  import { PUZZLE_CODES } from '../../game/constants';

  // Show/hide the padlock UI
  let isVisible = false;

  // Current code input (4 digits, each 0-9)
  let code = [0, 0, 0, 0];

  // Valid codes from game constants
  const validCodes = PUZZLE_CODES.PADLOCK_VALID;

  // Listen for show padlock event
  EventBus.on('show-padlock', () => {
    isVisible = true;
    // Reset code when opening
    code = [0, 0, 0, 0];
  });

  /**
   * Increment a digit (0-9, wraps around)
   */
  function incrementDigit(index: number) {
    code[index] = (code[index] + 1) % 10;
  }

  /**
   * Decrement a digit (0-9, wraps around)
   */
  function decrementDigit(index: number) {
    code[index] = (code[index] - 1 + 10) % 10;
  }

  /**
   * Check if the entered code is correct
   */
  function checkCode() {
    const enteredCode = code.join('');

    if (validCodes.includes(enteredCode)) {
      // Success!
      isVisible = false;
      EventBus.emit('gate-unlocked');
    } else {
      // Incorrect - shake animation or sound effect could go here
      console.log('Incorrect code');
    }
  }

  /**
   * Close the padlock UI without unlocking
   */
  function close() {
    isVisible = false;
  }
</script>

{#if isVisible}
  <!-- Modal overlay -->
  <div class="padlock-overlay" onclick={close}>
    <!-- Padlock container - prevent click propagation -->
    <div class="padlock-container" onclick={(e) => e.stopPropagation()}>
      <!-- Padlock image -->
      <div class="padlock-image">
        <img
          src="/assets/images/ui/padlock_closeup_4digit.png"
          alt="Padlock"
        />
      </div>

      <!-- Code input dials -->
      <div class="code-dials">
        {#each code as digit, i}
          <div class="dial">
            <button class="dial-button up" onclick={() => incrementDigit(i)}>
              ▲
            </button>
            <div class="digit-display">{digit}</div>
            <button class="dial-button down" onclick={() => decrementDigit(i)}>
              ▼
            </button>
          </div>
        {/each}
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <button class="unlock-button" onclick={checkCode}>Desbloquear</button>
        <button class="close-button" onclick={close}>Fechar</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .padlock-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  }

  .padlock-container {
    position: relative;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    padding: 40px;
    background: linear-gradient(135deg, #1a0f2e 0%, #0a0515 100%);
    border: 3px solid #ff5e00;
    border-radius: 10px;
    box-shadow:
      0 10px 50px rgba(255, 94, 0, 0.4),
      0 0 100px rgba(138, 43, 226, 0.3);
  }

  .padlock-image {
    width: 100%;
    max-width: 500px;
  }

  .padlock-image img {
    width: 100%;
    height: auto;
    display: block;
    filter: drop-shadow(0 0 20px rgba(255, 94, 0, 0.3));
  }

  .code-dials {
    display: flex;
    gap: 20px;
    justify-content: center;
  }

  .dial {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .dial-button {
    background: linear-gradient(135deg, #ff5e00 0%, #ff8533 100%);
    border: 2px solid #ff5e00;
    color: white;
    font-size: 20px;
    font-weight: bold;
    width: 50px;
    height: 40px;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 5px;
    box-shadow:
      0 2px 10px rgba(255, 94, 0, 0.3),
      inset 0 -2px 5px rgba(0, 0, 0, 0.3);
  }

  .dial-button:hover {
    background: linear-gradient(135deg, #ff7a33 0%, #ffa366 100%);
    border-color: #ffa366;
    box-shadow:
      0 4px 15px rgba(255, 94, 0, 0.5),
      inset 0 -2px 5px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  .dial-button:active {
    transform: translateY(0);
    box-shadow:
      0 2px 8px rgba(255, 94, 0, 0.3),
      inset 0 -2px 5px rgba(0, 0, 0, 0.3);
  }

  .digit-display {
    font-size: 48px;
    font-weight: bold;
    color: #ff5e00;
    text-shadow:
      0 0 10px rgba(255, 94, 0, 0.8),
      0 0 20px rgba(255, 94, 0, 0.4);
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 8px;
    border: 2px solid #ff5e00;
    min-width: 70px;
    text-align: center;
  }

  .action-buttons {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }

  .unlock-button,
  .close-button {
    padding: 15px 40px;
    font-family: 'Arial Black', 'Arial Bold', 'Gadget', sans-serif;
    font-size: 20px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    border: 3px solid;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 5px;
  }

  .unlock-button {
    background: linear-gradient(135deg, #ff5e00 0%, #ff8533 100%);
    border-color: #ff5e00;
    color: white;
    box-shadow:
      0 4px 15px rgba(255, 94, 0, 0.5),
      0 0 30px rgba(255, 94, 0, 0.3),
      inset 0 -3px 10px rgba(0, 0, 0, 0.3);
  }

  .unlock-button:hover {
    background: linear-gradient(135deg, #ff7a33 0%, #ffa366 100%);
    border-color: #ffa366;
    transform: translateY(-2px);
    box-shadow:
      0 6px 25px rgba(255, 94, 0, 0.7),
      0 0 50px rgba(255, 94, 0, 0.5),
      inset 0 -3px 10px rgba(0, 0, 0, 0.3);
  }

  .close-button {
    background: linear-gradient(135deg, #4a0a5a 0%, #6a1a7a 100%);
    border-color: #8a2aba;
    color: white;
    box-shadow:
      0 4px 15px rgba(138, 42, 186, 0.5),
      0 0 30px rgba(138, 42, 186, 0.3),
      inset 0 -3px 10px rgba(0, 0, 0, 0.3);
  }

  .close-button:hover {
    background: linear-gradient(135deg, #6a1a7a 0%, #8a2aba 100%);
    border-color: #aa4ada;
    transform: translateY(-2px);
    box-shadow:
      0 6px 25px rgba(138, 42, 186, 0.7),
      0 0 50px rgba(138, 42, 186, 0.5),
      inset 0 -3px 10px rgba(0, 0, 0, 0.3);
  }

  .unlock-button:active,
  .close-button:active {
    transform: translateY(0);
  }

  /* Responsive */
  @media (max-width: 700px) {
    .padlock-container {
      max-width: 90vw;
      padding: 20px;
      gap: 20px;
    }

    .code-dials {
      gap: 10px;
    }

    .dial-button {
      width: 40px;
      height: 35px;
      font-size: 16px;
    }

    .digit-display {
      font-size: 36px;
      padding: 8px 15px;
      min-width: 60px;
    }

    .unlock-button,
    .close-button {
      padding: 12px 30px;
      font-size: 16px;
    }
  }
</style>
