<script lang="ts">
  import { onMount } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  let isVisible = $state(false);
  let addToInventoryAfterClose = $state(false);

  /**
   * Show the note close-up
   * @param data.addToInventory - Whether to add the note to inventory after closing
   */
  function showNoteCloseup(data?: { addToInventory?: boolean }) {
    isVisible = true;
    addToInventoryAfterClose = data?.addToInventory ?? false;
    console.log('[NoteCloseup] Showing close-up, addToInventory:', addToInventoryAfterClose);
  }

  /**
   * Close the note close-up
   */
  function closeCloseup() {
    isVisible = false;
    console.log('[NoteCloseup] Closing, addToInventory:', addToInventoryAfterClose);

    // Emit event that close-up was closed
    EventBus.emit('note-closeup-closed', { addToInventory: addToInventoryAfterClose });

    // Reset flag
    addToInventoryAfterClose = false;
  }

  /**
   * Handle ESC key to close
   */
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isVisible) {
      closeCloseup();
    }
  }

  onMount(() => {
    EventBus.on('show-note-closeup', showNoteCloseup);

    return () => {
      EventBus.off('show-note-closeup', showNoteCloseup);
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isVisible}
  <div class="note-closeup-overlay" onclick={closeCloseup}>
    <div class="note-closeup-container" onclick={(e) => e.stopPropagation()}>
      <!-- Close button -->
      <button class="close-button" onclick={closeCloseup} aria-label="Fechar">
        ✕
      </button>

      <!-- Note image -->
      <img
        src="/assets/images/ui/owls_note_closeup.png"
        alt="Bilhete da Coruja"
        class="note-image"
      />

      <!-- Instructions -->
      <p class="instructions">Clique fora ou pressione ESC para fechar</p>
    </div>
  </div>
{/if}

<style>
  .note-closeup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
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

  .note-closeup-container {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
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

  .note-image {
    max-width: 100%;
    max-height: 70vh;
    height: auto;
    border: 4px solid #8b4513;
    border-radius: 8px;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.8),
      0 0 20px rgba(255, 94, 0, 0.3);
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }

  .close-button {
    position: absolute;
    top: -50px;
    right: 0;
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
  }

  /* Responsive */
  @media (max-width: 768px) {
    .note-image {
      max-height: 60vh;
    }

    .close-button {
      top: -40px;
      width: 35px;
      height: 35px;
      font-size: 20px;
    }

    .instructions {
      font-size: 12px;
    }
  }
</style>
