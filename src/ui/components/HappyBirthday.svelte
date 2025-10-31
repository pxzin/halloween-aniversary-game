<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { EventBus } from '../../game/EventBus';

  let isVisible = $state(false);
  let showConfetti = $state(false);

  function show() {
    console.log('[HappyBirthday] Showing happy birthday screen');
    isVisible = true;
    // Start confetti animation after a brief delay
    setTimeout(() => {
      showConfetti = true;
    }, 500);
  }

  function close() {
    console.log('[HappyBirthday] Closing happy birthday screen and returning to home');
    isVisible = false;
    showConfetti = false;

    // Navigate back to home
    push('/');
  }

  onMount(() => {
    EventBus.on('show-happy-birthday', show);
  });

  onDestroy(() => {
    EventBus.off('show-happy-birthday', show);
  });
</script>

{#if isVisible}
  <div class="birthday-overlay">
    <div class="birthday-container">
      <!-- Confetti animation -->
      {#if showConfetti}
        <div class="confetti-container">
          {#each Array(50) as _}
            <div
              class="confetti"
              style="left: {Math.random() * 100}%; animation-delay: {Math.random() * 3}s; animation-duration: {3 + Math.random() * 2}s;"
            >
              {['🎉', '🎊', '🎈', '✨', '🌟', '💜', '🎁', '🍰'][Math.floor(Math.random() * 8)]}
            </div>
          {/each}
        </div>
      {/if}

      <!-- Main content -->
      <div class="content">
        <h1 class="title">Feliz Aniversário, meu amor!</h1>

        <div class="message">
          <p class="dedication-title">Para a Jéssica,</p>
          <p class="dedication-text">
            Cada momento com você é um presente. Esta é só uma pequena forma de celebrar o seu dia.
            Obrigado por tanto. Feliz aniversário, meu amor!!
          </p>
        </div>

        <div class="heart-container">
          💜
        </div>

        <div class="footer-message">
          <p class="signature">Com todo o meu carinho,<br>Ric</p>
        </div>

        <button class="close-button" onclick={close}>
          Fechar
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .birthday-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    animation: fadeIn 1s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .birthday-container {
    position: relative;
    width: 90%;
    max-width: 800px;
    height: 90%;
    max-height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .confetti-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }

  .confetti {
    position: absolute;
    font-size: 24px;
    animation: fall linear infinite;
    top: -10%;
  }

  @keyframes fall {
    to {
      transform: translateY(120vh) rotate(360deg);
    }
  }

  .content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 40px;
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(75, 0, 130, 0.3) 100%);
    border: 3px solid #ff5e00;
    border-radius: 20px;
    box-shadow: 0 0 60px rgba(255, 94, 0, 0.6), 0 0 100px rgba(138, 43, 226, 0.4);
    backdrop-filter: blur(10px);
    animation: scaleIn 0.8s ease-out;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.5);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .title {
    font-size: 42px;
    font-weight: 900;
    color: #ff5e00;
    text-shadow:
      0 0 20px rgba(255, 94, 0, 0.8),
      0 0 40px rgba(255, 94, 0, 0.6);
    margin: 0 0 40px 0;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .message {
    margin-bottom: 30px;
  }

  .dedication-title {
    font-size: 24px;
    font-weight: bold;
    color: #a78bfa;
    margin: 0 0 20px 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }

  .dedication-text {
    font-size: 20px;
    color: #ffffff;
    line-height: 1.8;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    max-width: 600px;
    margin: 0 auto;
  }

  .heart-container {
    font-size: 80px;
    margin: 30px 0;
    animation: heartbeat 1.5s ease-in-out infinite;
  }

  @keyframes heartbeat {
    0%, 100% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.2);
    }
    50% {
      transform: scale(1);
    }
  }

  .footer-message {
    margin: 30px 0;
  }

  .signature {
    font-size: 22px;
    font-weight: bold;
    color: #ff69b4;
    line-height: 1.6;
    margin: 0;
    text-shadow:
      0 0 15px rgba(255, 105, 180, 0.6),
      0 2px 10px rgba(0, 0, 0, 0.5);
  }

  .close-button {
    margin-top: 30px;
    padding: 15px 40px;
    background: linear-gradient(135deg, #ff5e00 0%, #ff8533 100%);
    border: 2px solid #ff5e00;
    border-radius: 10px;
    color: white;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    box-shadow: 0 5px 20px rgba(255, 94, 0, 0.4);
  }

  .close-button:hover {
    background: linear-gradient(135deg, #ff7a33 0%, #ffa366 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(255, 94, 0, 0.6);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .birthday-container {
      width: 95%;
      height: 95%;
    }

    .content {
      padding: 30px 20px;
    }

    .title {
      font-size: 28px;
    }

    .dedication-title {
      font-size: 20px;
    }

    .dedication-text {
      font-size: 16px;
    }

    .heart-container {
      font-size: 60px;
    }

    .signature {
      font-size: 18px;
    }

    .confetti {
      font-size: 18px;
    }
  }
</style>
