<script lang="ts">
  import { push } from 'svelte-spa-router';

  /**
   * Start the game by navigating to /game route
   */
  function startGame() {
    push('/game');
  }
</script>

<div class="home-page">
  <!-- Logo Container with specific background -->
  <div class="logo-container">
    <img
      src="/assets/images/ui/logo.png"
      alt="Halloween Anniversary Logo"
      class="logo"
    />
  </div>

  <!-- Menu Buttons -->
  <div class="menu-buttons">
    <button class="menu-button primary" onclick={startGame}>
      <span class="button-text">Novo Jogo</span>
      <div class="button-glow"></div>
    </button>
  </div>

  <!-- Decorative Elements -->
  <div class="decorative-pumpkin left">🎃</div>
  <div class="decorative-pumpkin right">🎃</div>
  <div class="decorative-ghost left">👻</div>
  <div class="decorative-ghost right">👻</div>
</div>

<style>
  .home-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 60px;
    overflow: hidden;
    background: #070014;
  }

  /* Logo Container */
  .logo-container {
    animation: fadeInDown 1s ease-out;
  }

  .logo {
    max-width: 600px;
    width: 90vw;
    height: auto;
    display: block;
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Menu Buttons */
  .menu-buttons {
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: fadeInUp 1s ease-out 0.3s both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu-button {
    position: relative;
    padding: 20px 80px;
    font-family: 'Arial Black', 'Arial Bold', 'Gadget', sans-serif;
    font-size: 28px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 3px;
    background: linear-gradient(135deg, #ff5e00 0%, #ff8533 100%);
    border: 4px solid #ff5e00;
    color: white;
    cursor: pointer;
    transform: skewX(-3deg);
    transition: all 0.3s ease;
    overflow: hidden;
    box-shadow:
      0 4px 15px rgba(255, 94, 0, 0.5),
      0 0 30px rgba(255, 94, 0, 0.3),
      inset 0 -3px 10px rgba(0, 0, 0, 0.3);
  }

  .menu-button .button-text {
    position: relative;
    z-index: 2;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .menu-button .button-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
    z-index: 1;
  }

  .menu-button:hover .button-glow {
    left: 100%;
  }

  .menu-button.primary:hover {
    background: linear-gradient(135deg, #ff7a33 0%, #ffa366 100%);
    border-color: #ffa366;
    transform: skewX(-3deg) translateX(10px) scale(1.05);
    box-shadow:
      0 6px 25px rgba(255, 94, 0, 0.7),
      0 0 50px rgba(255, 94, 0, 0.5),
      inset 0 -3px 10px rgba(0, 0, 0, 0.3);
  }

  .menu-button:active {
    transform: skewX(-3deg) translateX(10px) scale(0.98);
  }

  /* Decorative Elements */
  .decorative-pumpkin,
  .decorative-ghost {
    position: absolute;
    font-size: 80px;
    opacity: 0.3;
    pointer-events: none;
  }

  .decorative-pumpkin.left {
    left: 5%;
    top: 20%;
    animation: decorFloat 6s infinite ease-in-out;
  }

  .decorative-pumpkin.right {
    right: 8%;
    top: 60%;
    animation: decorFloat 8s infinite ease-in-out 1s;
  }

  .decorative-ghost.left {
    left: 10%;
    bottom: 15%;
    animation: decorFloat 7s infinite ease-in-out 2s;
  }

  .decorative-ghost.right {
    right: 5%;
    top: 30%;
    animation: decorFloat 9s infinite ease-in-out 3s;
  }

  @keyframes decorFloat {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
      opacity: 0.2;
    }
    50% {
      transform: translateY(-30px) rotate(10deg);
      opacity: 0.4;
    }
  }

  /* Responsive */
  @media (max-width: 900px) {
    .logo {
      max-width: 400px;
    }

    .menu-button {
      padding: 18px 60px;
      font-size: 24px;
    }

    .decorative-pumpkin,
    .decorative-ghost {
      font-size: 60px;
    }
  }

  @media (max-width: 600px) {
    .home-page {
      gap: 40px;
    }

    .logo {
      max-width: 300px;
    }

    .menu-button {
      padding: 16px 40px;
      font-size: 20px;
      letter-spacing: 2px;
    }

    .decorative-pumpkin,
    .decorative-ghost {
      font-size: 50px;
    }
  }
</style>
