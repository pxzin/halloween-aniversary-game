<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';
  import { DialogueManager } from '../../game/services/DialogueManager';

  let isVisible = $state(false);
  let allCollected = $state(false);

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
    if (gift && !gift.collected) {
      gift.collected = true;
      console.log(`Gift ${data.giftId} collected`);

      // Check if all gifts are collected
      checkAllCollected();
    }
  }

  /**
   * Check if all gifts have been collected
   */
  function checkAllCollected() {
    const allGiftsCollected = gifts.every(g => g.collected);

    if (allGiftsCollected && !allCollected) {
      allCollected = true;
      console.log('[Objectives] All offerings collected! Office unlocked!');

      // Emit event to unlock office door
      EventBus.emit('all-offerings-collected');

      // Show dialogue about office door unlocking
      setTimeout(() => {
        DialogueManager.loadScript('general', 'all_offerings_collected').then(() => {
          DialogueManager.startDialogue();
        });
      }, 500); // Small delay for better UX
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
  <div class="objectives-inline">
    <h2 class="objectives-title">Oferendas</h2>

    <div class="gifts-row">
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
  </div>
{/if}

<style>
  .objectives-inline {
    display: flex;
    align-items: center;
    gap: 16px;
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .objectives-title {
    font-size: 18px;
    font-weight: 900;
    font-family: 'Arial Black', 'Arial Bold', 'Gadget', sans-serif;
    color: #ff5e00;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow:
      0 0 10px rgba(255, 94, 0, 0.8),
      0 0 20px rgba(255, 94, 0, 0.5);
    white-space: nowrap;
    margin: 0;
  }

  .gifts-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .gift-slot {
    background: linear-gradient(135deg, rgba(26, 10, 35, 0.9) 0%, rgba(10, 5, 20, 0.9) 100%);
    border: 2px solid #8a2be2;
    border-radius: 8px;
    padding: 6px;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    box-shadow: 0 2px 8px rgba(138, 43, 226, 0.2);
    min-width: 60px;
  }

  .gift-slot:hover {
    border-color: #ff5e00;
    box-shadow:
      0 4px 12px rgba(255, 94, 0, 0.4),
      0 0 20px rgba(138, 43, 226, 0.3);
    transform: translateY(-2px);
  }

  .gift-slot.collected {
    background: linear-gradient(135deg, rgba(255, 94, 0, 0.3) 0%, rgba(255, 94, 0, 0.2) 100%);
    border-color: #58cc02;
    box-shadow:
      0 4px 16px rgba(88, 204, 2, 0.6),
      0 0 30px rgba(88, 204, 2, 0.4);
  }

  .gift-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(255, 94, 0, 0.3) 100%);
    border: 2px solid #8a2be2;
    border-radius: 50%;
    font-size: 18px;
    color: #ffffff;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .gift-slot.collected .gift-icon {
    background: linear-gradient(135deg, rgba(88, 204, 2, 0.5) 0%, rgba(88, 204, 2, 0.3) 100%);
    border-color: #58cc02;
    font-size: 20px;
  }

  .gift-name {
    font-size: 10px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 0 8px rgba(255, 94, 0, 0.3);
    white-space: nowrap;
    text-align: center;
  }

  .gift-slot.collected .gift-name {
    color: #58cc02;
    text-shadow: 0 0 10px rgba(88, 204, 2, 0.5);
  }

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    .objectives-title {
      font-size: 16px;
    }

    .gift-slot {
      min-width: 55px;
      padding: 5px;
    }

    .gift-icon {
      width: 28px;
      height: 28px;
      font-size: 16px;
    }

    .gift-slot.collected .gift-icon {
      font-size: 18px;
    }

    .gift-name {
      font-size: 9px;
    }
  }

  @media (max-width: 900px) {
    .objectives-inline {
      gap: 12px;
    }

    .objectives-title {
      font-size: 14px;
      letter-spacing: 1px;
    }

    .gifts-row {
      gap: 6px;
    }

    .gift-slot {
      min-width: 50px;
      padding: 4px;
    }

    .gift-icon {
      width: 24px;
      height: 24px;
      font-size: 14px;
    }

    .gift-slot.collected .gift-icon {
      font-size: 16px;
    }

    .gift-name {
      font-size: 8px;
    }
  }
</style>
