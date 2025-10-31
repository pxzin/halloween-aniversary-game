<script lang="ts">
  import { onMount } from 'svelte';
  import { EventBus } from '../../game/EventBus';
  import { DEV_MODE } from '../../config/devMode';

  let isVisible = $state(false);
  let imageSrc = $state('');
  let title = $state('');
  let zones: Array<{ id: string; x: number; y: number; width: number; height: number; label: string }> = $state([]);

  /**
   * Show the puzzle close-up
   */
  function showCloseup(data: {
    image: string;
    title: string;
    zones: Array<{ id: string; x: number; y: number; width: number; height: number; label: string }>;
  }) {
    imageSrc = `/assets/images/ui/${data.image}.png`;
    title = data.title;
    zones = data.zones;
    isVisible = true;
    console.log('[PuzzleCloseup] Showing close-up:', data);
  }

  /**
   * Close the close-up
   */
  function closeCloseup() {
    isVisible = false;
    console.log('[PuzzleCloseup] Closing');

    // Emit event that close-up was closed
    EventBus.emit('closeup-closed');
  }

  /**
   * Handle zone clicked
   */
  function onZoneClicked(zoneId: string) {
    console.log('[PuzzleCloseup] Zone clicked:', zoneId);
    EventBus.emit('closeup-zone-clicked', { zoneId });
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
    EventBus.on('show-closeup', showCloseup);
    EventBus.on('close-closeup', closeCloseup);

    return () => {
      EventBus.off('show-closeup', showCloseup);
      EventBus.off('close-closeup', closeCloseup);
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isVisible}
  <div class="closeup-overlay" onclick={closeCloseup}>
    <div class="closeup-container" onclick={(e) => e.stopPropagation()}>
      <!-- Close button -->
      <button class="close-button" onclick={closeCloseup} aria-label="Fechar">
        ✕
      </button>

      <!-- Title -->
      {#if title}
        <h2 class="closeup-title">{title}</h2>
      {/if}

      <!-- Image with clickable zones -->
      <div class="image-container">
        <img
          src={imageSrc}
          alt={title}
          class="closeup-image"
        />

        <!-- Clickable zones overlay -->
        {#each zones as zone}
          <button
            class="clickable-zone"
            class:dev-visible={DEV_MODE}
            style="left: {zone.x}px; top: {zone.y}px; width: {zone.width}px; height: {zone.height}px;"
            onclick={() => onZoneClicked(zone.id)}
            aria-label={zone.label}
          >
            {#if DEV_MODE}
              <span class="zone-label">{zone.label}</span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Instructions -->
      <p class="instructions">Clique fora ou pressione ESC para fechar</p>
    </div>
  </div>
{/if}

<style>
  .closeup-overlay {
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

  .closeup-container {
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

  .closeup-title {
    font-size: 28px;
    font-weight: 900;
    font-family: 'Arial Black', 'Arial Bold', 'Gadget', sans-serif;
    color: #ff5e00;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-shadow:
      0 0 20px rgba(255, 94, 0, 1),
      0 0 40px rgba(255, 94, 0, 0.8);
    margin: 0;
  }

  .image-container {
    position: relative;
    max-width: 100%;
    max-height: 70vh;
  }

  .closeup-image {
    max-width: 100%;
    max-height: 70vh;
    height: auto;
    border: 4px solid #ff5e00;
    border-radius: 8px;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.8),
      0 0 20px rgba(255, 94, 0, 0.5);
    display: block;
  }

  .clickable-zone {
    position: absolute;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Only show visual indicators in dev mode */
  .clickable-zone.dev-visible {
    background: rgba(255, 94, 0, 0.2);
    border: 2px solid rgba(255, 94, 0, 0.6);
  }

  .clickable-zone.dev-visible:hover {
    background: rgba(255, 94, 0, 0.4);
    border-color: #ff5e00;
    box-shadow: 0 0 20px rgba(255, 94, 0, 0.8);
  }

  .zone-label {
    color: white;
    font-size: 18px;
    font-weight: bold;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.8),
      0 0 10px rgba(255, 94, 0, 0.8);
    pointer-events: none;
    background: rgba(0, 0, 0, 0.6);
    padding: 8px 16px;
    border-radius: 8px;
    border: 2px solid rgba(255, 94, 0, 0.8);
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
    .closeup-image {
      max-height: 60vh;
    }

    .close-button {
      top: -40px;
      width: 35px;
      height: 35px;
      font-size: 20px;
    }

    .closeup-title {
      font-size: 22px;
      letter-spacing: 2px;
    }

    .zone-label {
      font-size: 12px;
    }

    .instructions {
      font-size: 12px;
    }
  }
</style>
