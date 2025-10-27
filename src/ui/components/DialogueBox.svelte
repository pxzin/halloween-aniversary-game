<script lang="ts">
  import { dialogue } from '../stores';
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  /**
   * Handle show-dialogue event from EventBus
   */
  function handleShowDialogue(data: any) {
    dialogue.set(data);
  }

  /**
   * Clear the dialogue
   */
  function clearDialogue() {
    dialogue.set(null);
  }

  onMount(() => {
    EventBus.on('show-dialogue', handleShowDialogue);
  });

  onDestroy(() => {
    EventBus.off('show-dialogue', handleShowDialogue);
  });
</script>

{#if $dialogue}
  <div class="dialogue-box">
    <div class="dialogue-content">
      <div class="character-portrait">
        <div class="portrait-placeholder">
          {$dialogue.character === 'jessica' ? '👧' : '🦉'}
        </div>
        <div class="character-name">
          {$dialogue.character === 'jessica' ? 'Jessica' : 'Duolingo'}
        </div>
      </div>

      <div class="dialogue-text">
        <p>{$dialogue.text}</p>
      </div>

      <button class="close-button" onclick={clearDialogue}>
        ✕
      </button>
    </div>
  </div>
{/if}

<style>
  .dialogue-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 16px 24px;
  }

  .dialogue-content {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    background-color: #3d3d3d;
    border: 2px solid #ff6b35;
    border-radius: 12px;
    padding: 16px;
    position: relative;
  }

  .character-portrait {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 80px;
  }

  .portrait-placeholder {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  .character-name {
    font-size: 12px;
    font-weight: bold;
    color: #ff6b35;
    text-transform: uppercase;
  }

  .dialogue-text {
    flex: 1;
    color: #ffffff;
    font-size: 16px;
    line-height: 1.5;
  }

  .dialogue-text p {
    margin: 0;
  }

  .close-button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    color: #ff6b35;
    font-size: 24px;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
    transition: color 0.2s;
  }

  .close-button:hover {
    color: #ff8c5a;
  }
</style>
