<script lang="ts">
  import Clock from './Clock.svelte';
  import Inventory from './Inventory.svelte';
  import DialogueBox from './DialogueBox.svelte';
</script>

<div class="game-container">
  <!-- Top bar: Clock -->
  <div class="clock-bar">
    <Clock />
  </div>

  <!-- Center: Phaser game canvas -->
  <div class="game-area">
    <div id="game-container"></div>
  </div>

  <!-- Right sidebar: Inventory -->
  <div class="inventory-sidebar">
    <Inventory />
  </div>

  <!-- Bottom bar: Dialogue -->
  <div class="dialogue-bar">
    <DialogueBox />
  </div>
</div>

<style>
  .game-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-columns: 1fr 250px;
    grid-template-rows: 60px 1fr 150px;
    grid-template-areas:
      "clock clock"
      "game inventory"
      "dialogue dialogue";
    background-color: #1a1a1a;
  }

  .clock-bar {
    grid-area: clock;
    background-color: #2d2d2d;
    border-bottom: 2px solid #ff6b35;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .game-area {
    grid-area: game;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .inventory-sidebar {
    grid-area: inventory;
    background-color: #2d2d2d;
    border-left: 2px solid #ff6b35;
    overflow-y: auto;
  }

  .dialogue-bar {
    grid-area: dialogue;
    background-color: #2d2d2d;
    border-top: 2px solid #ff6b35;
  }
</style>
