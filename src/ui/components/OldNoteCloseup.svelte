<script lang="ts">
  import { onMount } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  let isVisible = $state(false);

  /**
   * Show the old note closeup
   */
  function showCloseup() {
    isVisible = true;
    console.log('[OldNoteCloseup] Showing old note closeup');
  }

  /**
   * Close the old note closeup
   */
  function closeCloseup() {
    isVisible = false;
    console.log('[OldNoteCloseup] Closing old note closeup');
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
    EventBus.on('show-old-note-closeup', showCloseup);

    return () => {
      EventBus.off('show-old-note-closeup', showCloseup);
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isVisible}
  <div class="old-note-closeup-overlay" onclick={closeCloseup}>
    <div class="old-note-closeup-container" onclick={(e) => e.stopPropagation()}>
      <!-- Close button -->
      <button class="close-button" onclick={closeCloseup} aria-label="Fechar">
        ✕
      </button>

      <!-- Old note closeup image -->
      <img
        src="/assets/images/ui/old_note_closeup.png"
        alt="Bilhete Antigo"
        class="old-note-image"
      />
    </div>
  </div>
{/if}

<style>
  .old-note-closeup-overlay {
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

  .old-note-closeup-container {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .old-note-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border: 4px solid #8B4513;
    border-radius: 8px;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.8),
      0 0 30px rgba(139, 69, 19, 0.5);
  }

  .close-button {
    position: absolute;
    top: -15px;
    right: -15px;
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
    z-index: 10001;
  }

  .close-button:hover {
    background: linear-gradient(135deg, #ff7a33 0%, #ffa366 100%);
    transform: scale(1.1);
    box-shadow: 0 6px 15px rgba(255, 94, 0, 0.6);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .old-note-image {
      max-width: 95vw;
      max-height: 85vh;
    }
  }
</style>
