<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  let isVisible = $state(false);

  // 5 gifts to collect
  const gifts = $state([
    { id: 'gift1', name: 'Oferenda 1', collected: false, icon: '🎁' },
    { id: 'gift2', name: 'Oferenda 2', collected: false, icon: '🎁' },
    { id: 'gift3', name: 'Oferenda 3', collected: false, icon: '🎁' },
    { id: 'gift4', name: 'Oferenda 4', collected: false, icon: '🎁' },
    { id: 'gift5', name: 'Oferenda 5', collected: false, icon: '🎁' },
  ]);

  /**
   * Reveal objectives UI
   */
  function revealObjectives() {
    console.log('Objectives revealed');
    isVisible = true;
  }

  /**
   * Mark a gift as collected
   */
  function collectGift(data: { giftId: string }) {
    const gift = gifts.find(g => g.id === data.giftId);
    if (gift) {
      gift.collected = true;
      console.log(`Gift ${data.giftId} collected`);
    }
  }

  onMount(() => {
    EventBus.on('reveal-objectives', revealObjectives);
    EventBus.on('gift-collected', collectGift);
  });

  onDestroy(() => {
    EventBus.off('reveal-objectives', revealObjectives);
    EventBus.off('gift-collected', collectGift);
  });
</script>

{#if isVisible}
  <div class="objectives-panel">
    <h2 class="objectives-title">Oferendas</h2>

    <div class="gifts-grid">
      {#each gifts as gift (gift.id)}
        <div class="gift-slot" class:collected={gift.collected}>
          <div class="gift-icon">
            {#if gift.collected}
              ✓
            {:else}
              ?
            {/if}
          </div>
          <div class="gift-name">{gift.name}</div>
        </div>
      {/each}
    </div>

    <div class="objectives-footer">
      <p class="warning-text">Encontre antes da meia-noite!</p>
    </div>
  </div>
{/if}

<style>
  .objectives-panel {
    position: absolute;
    top: 60px;
    left: 0;
    width: 220px;
    height: calc(100% - 240px);
    background: linear-gradient(135deg, rgba(10, 5, 20, 0.95) 0%, rgba(26, 10, 35, 0.95) 100%);
    border-right: 3px solid #ff5e00;
    padding: 20px;
    z-index: 50;
    box-shadow: inset 0 0 30px rgba(138, 43, 226, 0.2);
    animation: slideInLeft 0.5s ease-out;
    display: flex;
    flex-direction: column;
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .objectives-title {
    font-size: 20px;
    font-weight: 900;
    font-family: 'Arial Black', 'Arial Bold', 'Gadget', sans-serif;
    color: #ff5e00;
    margin-bottom: 20px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow:
      0 0 15px rgba(255, 94, 0, 0.8),
      0 0 30px rgba(255, 94, 0, 0.5),
      0 0 45px rgba(138, 43, 226, 0.3);
  }

  .gifts-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    overflow-y: auto;
  }

  .gifts-grid::-webkit-scrollbar {
    width: 6px;
  }

  .gifts-grid::-webkit-scrollbar-track {
    background: rgba(10, 0, 21, 0.5);
    border-radius: 3px;
  }

  .gifts-grid::-webkit-scrollbar-thumb {
    background: #ff5e00;
    border-radius: 3px;
  }

  .gift-slot {
    background: linear-gradient(135deg, rgba(26, 10, 35, 0.9) 0%, rgba(10, 5, 20, 0.9) 100%);
    border: 2px solid #8a2be2;
    border-radius: 8px;
    padding: 12px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(138, 43, 226, 0.2);
  }

  .gift-slot:hover {
    border-color: #ff5e00;
    box-shadow:
      0 4px 12px rgba(255, 94, 0, 0.4),
      0 0 20px rgba(138, 43, 226, 0.3);
  }

  .gift-slot.collected {
    background: linear-gradient(135deg, rgba(255, 94, 0, 0.3) 0%, rgba(255, 94, 0, 0.2) 100%);
    border-color: #58cc02;
    box-shadow:
      0 4px 16px rgba(88, 204, 2, 0.6),
      0 0 30px rgba(88, 204, 2, 0.4);
  }

  .gift-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(255, 94, 0, 0.3) 100%);
    border: 2px solid #8a2be2;
    border-radius: 50%;
    font-size: 24px;
    color: #ffffff;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .gift-slot.collected .gift-icon {
    background: linear-gradient(135deg, rgba(88, 204, 2, 0.5) 0%, rgba(88, 204, 2, 0.3) 100%);
    border-color: #58cc02;
    font-size: 28px;
  }

  .gift-name {
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
    flex: 1;
    text-shadow: 0 0 10px rgba(255, 94, 0, 0.3);
  }

  .gift-slot.collected .gift-name {
    color: #58cc02;
    text-shadow: 0 0 10px rgba(88, 204, 2, 0.5);
  }

  .objectives-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px solid rgba(138, 43, 226, 0.3);
  }

  .warning-text {
    color: #ff5e00;
    font-size: 11px;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
    opacity: 0.9;
    text-shadow: 0 0 10px rgba(255, 94, 0, 0.6);
    animation: pulse 2s infinite ease-in-out;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
  }

  /* Responsive - hide on small screens or adjust layout */
  @media (max-width: 1200px) {
    .objectives-panel {
      width: 180px;
      padding: 15px;
    }

    .objectives-title {
      font-size: 18px;
      margin-bottom: 16px;
    }

    .gift-icon {
      width: 36px;
      height: 36px;
      font-size: 20px;
    }

    .gift-slot.collected .gift-icon {
      font-size: 24px;
    }

    .gift-name {
      font-size: 12px;
    }
  }

  @media (max-width: 900px) {
    .objectives-panel {
      top: auto;
      bottom: 340px;
      left: 0;
      right: 0;
      width: 100%;
      height: auto;
      border-right: none;
      border-top: 3px solid #ff5e00;
      padding: 15px;
    }

    .gifts-grid {
      flex-direction: row;
      gap: 8px;
      overflow-x: auto;
      overflow-y: visible;
    }

    .gift-slot {
      flex-direction: column;
      min-width: 80px;
      text-align: center;
    }

    .gift-name {
      font-size: 10px;
    }
  }
</style>
