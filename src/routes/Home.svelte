<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { DEV_MODE } from '../config/devMode';

  // Check if in development mode (controlled by VITE_DEV_MODE in .env)
  const isDev = DEV_MODE;

  /**
   * Clear session storage on mount (reset game state when returning to home)
   */
  onMount(() => {
    sessionStorage.clear();
    console.log('[Home] Session storage cleared - Game state reset');
  });

  /**
   * Start the game by navigating to /game route
   */
  function startGame() {
    push('/game');
  }

  /**
   * Skip to a specific scene (dev only)
   */
  function skipToScene(sceneName: string) {
    // Set scene in sessionStorage before navigating
    sessionStorage.setItem('startScene', sceneName);
    console.log('Home - Setting startScene:', sceneName);

    // Special setup for LivingRoomScene - add required key
    if (sceneName === 'LivingRoomScene') {
      import('../ui/stores').then(({ inventory }) => {
        inventory.update(items => {
          // Check if key already exists
          if (!items.some(item => item.id === 'living_room_key')) {
            console.log('[Home] Adding living room key for dev access');
            return [...items, {
              id: 'living_room_key',
              name: 'Chave da Sala',
              icon: '🔑'
            }];
          }
          return items;
        });
      });
    }

    // Special setup for BathroomScene - add miniature rake for testing
    if (sceneName === 'BathroomScene') {
      import('../ui/stores').then(({ inventory }) => {
        inventory.update(items => {
          // Check if miniature_rake already exists
          if (!items.some(item => item.id === 'miniature_rake')) {
            console.log('[Home] Adding miniature_rake for dev access to BathroomScene');
            return [...items, {
              id: 'miniature_rake',
              name: 'Mini-Rastelo de Jardim',
              icon: '/assets/images/ui/miniature_rake.png'
            }];
          }
          return items;
        });
      });
    }

    push('/game');
  }

  /**
   * Clear session storage (dev only)
   */
  function clearSessionStorage() {
    sessionStorage.clear();
    console.log('Session storage cleared');
    alert('Session storage cleared! ✅');
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

    {#if isDev}
      <!-- Dev Scene Skip Buttons -->
      <div class="dev-skip-buttons">
        <p class="dev-label">DEV: Pular para cena</p>
        <div class="skip-grid">
          <button class="skip-button" onclick={() => skipToScene('IntroScene')}>
            Intro
          </button>
          <button class="skip-button" onclick={() => skipToScene('FachadaScene')}>
            Fachada
          </button>
          <button class="skip-button" onclick={() => skipToScene('StairsScene')}>
            Escadas
          </button>
          <button class="skip-button" onclick={() => skipToScene('BalconyScene')}>
            Sacada
          </button>
          <button class="skip-button" onclick={() => skipToScene('HallwayScene')}>
            Corredor
          </button>
          <button class="skip-button" onclick={() => skipToScene('BackyardScene')}>
            Quintal
          </button>
          <button class="skip-button" onclick={() => skipToScene('LivingRoomScene')}>
            Sala
          </button>
          <button class="skip-button" onclick={() => skipToScene('KitchenScene')}>
            Cozinha
          </button>
          <button class="skip-button" onclick={() => skipToScene('BathroomScene')}>
            Banheiro
          </button>
          <button class="skip-button" onclick={() => skipToScene('BedroomScene')}>
            Quarto
          </button>
          <button class="skip-button" onclick={() => skipToScene('WorldScene')}>
            World
          </button>
        </div>

        <!-- Clear Storage Button -->
        <button class="clear-button" onclick={clearSessionStorage}>
          🗑️ Limpar Session Storage
        </button>
      </div>
    {/if}
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

  /* Dev Skip Buttons */
  .dev-skip-buttons {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }

  .dev-label {
    color: #ff5e00;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
    opacity: 0.7;
  }

  .skip-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .skip-button {
    padding: 10px 20px;
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    font-weight: bold;
    background: linear-gradient(135deg, #4a0a5a 0%, #6a1a7a 100%);
    border: 2px solid #8a2aba;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
      0 2px 10px rgba(138, 42, 186, 0.3),
      inset 0 -2px 5px rgba(0, 0, 0, 0.3);
  }

  .skip-button:hover {
    background: linear-gradient(135deg, #6a1a7a 0%, #8a2aba 100%);
    border-color: #aa4ada;
    transform: translateY(-2px);
    box-shadow:
      0 4px 15px rgba(138, 42, 186, 0.5),
      inset 0 -2px 5px rgba(0, 0, 0, 0.3);
  }

  .skip-button:active {
    transform: translateY(0);
  }

  .clear-button {
    margin-top: 20px;
    padding: 12px 24px;
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    font-weight: bold;
    background: linear-gradient(135deg, #8a0a0a 0%, #aa1a1a 100%);
    border: 2px solid #cc3333;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
      0 2px 10px rgba(204, 51, 51, 0.3),
      inset 0 -2px 5px rgba(0, 0, 0, 0.3);
  }

  .clear-button:hover {
    background: linear-gradient(135deg, #aa1a1a 0%, #cc3333 100%);
    border-color: #ee5555;
    transform: translateY(-2px);
    box-shadow:
      0 4px 15px rgba(204, 51, 51, 0.5),
      inset 0 -2px 5px rgba(0, 0, 0, 0.3);
  }

  .clear-button:active {
    transform: translateY(0);
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
