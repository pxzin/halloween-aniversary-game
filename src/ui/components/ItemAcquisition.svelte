<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';
  import { inventory } from '../stores';
  import type { Item } from '../stores';

  let isActive = false;
  let currentItem: Item | null = null;
  let isAnimating = false;

  /**
   * Show item acquisition animation
   */
  function showItemAcquisition(item: Item) {
    currentItem = item;
    isActive = true;

    // Start animation after a brief delay to ensure DOM is ready
    setTimeout(() => {
      isAnimating = true;
    }, 50);

    // After animation completes, add to inventory and close
    setTimeout(() => {
      if (currentItem) {
        inventory.update(items => [...items, currentItem!]);
      }

      // Emit completion event
      EventBus.emit('item-acquisition-complete', { item: currentItem });

      // Close modal
      isActive = false;
      isAnimating = false;
      currentItem = null;
    }, 2500); // Total animation time
  }

  /**
   * Check if icon is an image path (vs emoji)
   */
  function isImageIcon(icon: string): boolean {
    return icon.startsWith('/') || icon.includes('.png') || icon.includes('.jpg') || icon.includes('.jpeg');
  }

  onMount(() => {
    EventBus.on('item-acquired', showItemAcquisition);
  });

  onDestroy(() => {
    EventBus.off('item-acquired', showItemAcquisition);
  });
</script>

{#if isActive && currentItem}
  <div class="item-acquisition-overlay">
    <div class="item-acquisition-content" class:animating={isAnimating}>
      <!-- Item Icon -->
      <div class="item-icon-large">
        {#if isImageIcon(currentItem.icon)}
          <img src={currentItem.icon} alt={currentItem.name} class="item-image" />
        {:else}
          <div class="item-emoji">{currentItem.icon}</div>
        {/if}
      </div>

      <!-- Item Name -->
      <div class="item-acquired-text">
        {currentItem.name} adquirido!
      </div>
    </div>
  </div>
{/if}

<style>
  .item-acquisition-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .item-acquisition-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    opacity: 1;
    transform: scale(1) translate(0, 0);
  }

  .item-acquisition-content.animating {
    animation:
      scaleUp 0.5s ease-out 0s,
      hold 1s ease-out 0.5s,
      shrinkAndMove 1s ease-in 1.5s forwards;
  }

  @keyframes scaleUp {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes hold {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes shrinkAndMove {
    0% {
      opacity: 1;
      transform: scale(1) translate(0, 0);
    }
    100% {
      opacity: 0;
      transform: scale(0.2) translate(40vw, -40vh);
    }
  }

  .item-icon-large {
    width: 160px;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(255, 94, 0, 0.3) 100%);
    border: 4px solid #ff5e00;
    border-radius: 20px;
    box-shadow:
      0 0 40px rgba(255, 94, 0, 0.6),
      0 0 80px rgba(138, 43, 226, 0.4),
      inset 0 0 60px rgba(255, 94, 0, 0.2);
    animation: glow 1.5s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from {
      box-shadow:
        0 0 40px rgba(255, 94, 0, 0.6),
        0 0 80px rgba(138, 43, 226, 0.4),
        inset 0 0 60px rgba(255, 94, 0, 0.2);
    }
    to {
      box-shadow:
        0 0 60px rgba(255, 94, 0, 0.8),
        0 0 100px rgba(138, 43, 226, 0.6),
        inset 0 0 80px rgba(255, 94, 0, 0.3);
    }
  }

  .item-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 20px;
    filter: drop-shadow(0 0 20px rgba(255, 94, 0, 0.8));
  }

  .item-emoji {
    font-size: 100px;
    line-height: 1;
    filter: drop-shadow(0 0 20px rgba(255, 94, 0, 0.8));
  }

  .item-acquired-text {
    font-size: 32px;
    font-weight: 900;
    font-family: 'Arial Black', 'Arial Bold', 'Gadget', sans-serif;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-shadow:
      0 0 20px rgba(255, 94, 0, 1),
      0 0 40px rgba(255, 94, 0, 0.8),
      0 0 60px rgba(138, 43, 226, 0.6),
      2px 2px 4px rgba(0, 0, 0, 0.8);
    animation: pulse 1.5s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from {
      transform: scale(1);
      opacity: 0.9;
    }
    to {
      transform: scale(1.05);
      opacity: 1;
    }
  }

  @media (max-width: 900px) {
    .item-icon-large {
      width: 120px;
      height: 120px;
    }

    .item-emoji {
      font-size: 80px;
    }

    .item-acquired-text {
      font-size: 24px;
      letter-spacing: 2px;
    }
  }
</style>
