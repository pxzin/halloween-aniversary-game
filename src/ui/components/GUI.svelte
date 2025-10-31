<script lang="ts">
  import Clock from './Clock.svelte';
  import Inventory from './Inventory.svelte';
  import DialogueBox from './DialogueBox.svelte';
  import ChoiceBox from './ChoiceBox.svelte';
  import ItemAcquisition from './ItemAcquisition.svelte';
  import Objectives from './Objectives.svelte';
  import NoteCloseup from './NoteCloseup.svelte';
  import PuzzleCloseup from './PuzzleCloseup.svelte';
  import Safe from './Safe.svelte';
  import { inventoryVisible } from '../stores';
</script>

<!-- Background com abóboras flutuantes -->
<div class="pumpkin-bg">
  <div class="floating-pumpkin" style="left: 10%; top: 20%; animation-delay: 0s;">🎃</div>
  <div class="floating-pumpkin" style="left: 80%; top: 30%; animation-delay: 2s;">🎃</div>
  <div class="floating-pumpkin" style="left: 50%; top: 60%; animation-delay: 4s;">🎃</div>
</div>

<div class="game-container">
  <!-- Teias de aranha nos cantos -->
  <div class="spider-web top-left">🕸️</div>
  <div class="spider-web top-right">🕸️</div>
  <div class="spider-web bottom-left">🕸️</div>
  <div class="spider-web bottom-right">🕸️</div>

  <!-- Morcegos voadores -->
  <div class="bat" style="animation-delay: 0s;">🦇</div>
  <div class="bat" style="animation-delay: 4s; animation-duration: 10s;">🦇</div>

  <!-- Fantasmas flutuantes -->
  <div class="ghost" style="left: 15%; top: 15%;">👻</div>
  <div class="ghost" style="left: 75%; top: 25%; animation-delay: 3s;">👻</div>

  <!-- Timer bar with offerings and clock -->
  <div class="timer-bar">
    <!-- Objectives panel (inline, left side) -->
    <Objectives />

    <!-- Clock (right side) -->
    <Clock />
  </div>

  <!-- Inventário lateral direito -->
  {#if $inventoryVisible}
    <div class="inventory-panel">
      <Inventory />
    </div>
  {/if}

  <!-- Área do jogo (Phaser canvas) -->
  <div class="game-view" class:full-width={!$inventoryVisible}>
    <div id="game-container"></div>
  </div>

  <!-- Container de diálogo -->
  <div class="dialogue-container">
    <DialogueBox />
  </div>
</div>

<!-- Choice Box (overlay) -->
<ChoiceBox />

<!-- Item Acquisition Animation (overlay) -->
<ItemAcquisition />

<!-- Note Close-up (overlay) -->
<NoteCloseup />

<!-- Puzzle Close-up (overlay) -->
<PuzzleCloseup />

<!-- Safe Puzzle (overlay) -->
<Safe />

<style>
  /* Fundo animado */
  .pumpkin-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    opacity: 0.15;
    z-index: 1;
  }

  .floating-pumpkin {
    position: absolute;
    font-size: 40px;
    animation: float 15s infinite ease-in-out;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(10deg); }
  }

  /* Container principal */
  .game-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(1200px, 100vw);
    height: min(675px, 100vh);
    background: linear-gradient(135deg, #0a0a0a 0%, #1a0f2e 100%);
    box-shadow:
      0 10px 50px rgba(255, 94, 0, 0.4),
      0 0 100px rgba(138, 43, 226, 0.3);
    border: 2px solid #ff5e00;
    z-index: 10;
    overflow: hidden;
  }

  /* Morcegos */
  .bat {
    position: absolute;
    font-size: 25px;
    animation: flyBat 8s infinite linear;
    z-index: 2;
    opacity: 0.7;
  }

  @keyframes flyBat {
    0% {
      left: -50px;
      top: 20%;
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      left: 100%;
      top: 60%;
      transform: scale(1);
    }
  }

  /* Fantasmas */
  .ghost {
    position: absolute;
    font-size: 30px;
    animation: floatGhost 10s infinite ease-in-out;
    opacity: 0.6;
    z-index: 2;
  }

  /* Teias de aranha */
  .spider-web {
    position: absolute;
    font-size: 50px;
    opacity: 0.4;
    z-index: 3;
    pointer-events: none;
  }

  .spider-web.top-left {
    top: 10px;
    left: 10px;
  }

  .spider-web.top-right {
    top: 10px;
    right: 10px;
  }

  .spider-web.bottom-left {
    bottom: 10px;
    left: 10px;
  }

  .spider-web.bottom-right {
    bottom: 10px;
    right: 10px;
  }

  @keyframes floatGhost {
    0%, 100% {
      transform: translateY(0) translateX(0);
      opacity: 0.4;
    }
    50% {
      transform: translateY(-40px) translateX(30px);
      opacity: 0.7;
    }
  }

  /* Timer bar at the top */
  .timer-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(26, 15, 46, 0.8) 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid #ff5e00;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(255, 94, 0, 0.4);
    padding: 0 20px;
  }

  /* Inventário */
  .inventory-panel {
    position: absolute;
    top: 60px;
    right: 0;
    width: 280px;
    height: calc(100% - 240px);
    background: linear-gradient(135deg, rgba(10, 5, 20, 0.95) 0%, rgba(26, 10, 35, 0.95) 100%);
    border-left: 3px solid #ff5e00;
    padding: 20px;
    z-index: 50;
    box-shadow: inset 0 0 30px rgba(138, 43, 226, 0.2);
    overflow-y: auto;
  }

  /* Área do jogo */
  .game-view {
    position: absolute;
    top: 60px;
    left: 0;
    right: 280px;
    bottom: 180px;
    background: linear-gradient(135deg, #0a0015 0%, #1a0f2e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 50px rgba(138, 43, 226, 0.2);
    overflow: hidden;
    z-index: 20;
    transition: right 0.3s ease;
  }

  .game-view.full-width {
    right: 0;
  }

  .game-view :global(#game-container) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .game-view :global(canvas) {
    display: block !important;
  }

  /* Container de diálogo */
  .dialogue-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 180px;
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10, 5, 20, 0.8) 30%, rgba(0,0,0,0.98) 100%);
    z-index: 200;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .inventory-panel {
      width: 220px;
    }

    .game-view {
      right: 220px;
    }
  }

  @media (max-width: 900px) {
    .game-container {
      width: 100vw;
      height: 100vh;
      border: none;
    }

    .inventory-panel {
      width: 100%;
      height: 160px;
      top: auto;
      bottom: 180px;
      right: 0;
      left: 0;
      border-left: none;
      border-top: 3px solid #ff5e00;
      padding: 15px;
    }

    .game-view {
      top: 60px;
      bottom: 340px;
      right: 0;
    }

    .dialogue-container {
      height: 180px;
    }
  }
</style>
