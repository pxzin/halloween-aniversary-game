<script lang="ts">
  import { onMount } from 'svelte';
  import { inventory, selectedItem, combinationStore } from '../stores';
  import { CombinationService } from '../../game/services/CombinationService';
  import { EventBus } from '../../game/EventBus';
  import type { Item } from '../stores';

  /**
   * Handle item click
   * - If item is Owl's Note: show close-up
   * - If holding Shift: select for combination
   * - Otherwise: select for use in scene
   */
  async function handleItemClick(item: Item, event: MouseEvent) {
    // Special handling for Owl's Note - show close-up instead of selecting
    if (item.id === 'owls_note') {
      console.log('[Inventory] Opening Owl\'s Note close-up');
      EventBus.emit('show-note-closeup', { addToInventory: false });
      return;
    }

    if (event.shiftKey) {
      // Shift-click: combination mode
      const firstItem = $combinationStore;

      if (!firstItem) {
        // This is the first item for combination
        combinationStore.set(item);
      } else {
        // This is the second item, attempt combination
        const result = await CombinationService.combine(firstItem, item);

        if (result) {
          console.log(`Combined ${firstItem.name} + ${item.name} = ${result.name}`);
        } else {
          console.log(`Combined ${firstItem.name} + ${item.name} (no result item)`);
        }

        // Clear combination store
        combinationStore.set(null);
      }
    } else {
      // Normal click: select for use in scene
      if ($selectedItem?.id === item.id) {
        // Deselect if clicking the same item
        selectedItem.set(null);
      } else {
        selectedItem.set(item);
      }

      // Clear combination mode
      combinationStore.set(null);
    }
  }

  /**
   * Check if item is selected for combination
   */
  function isCombinationItem(item: Item): boolean {
    return $combinationStore?.id === item.id;
  }

  /**
   * Check if item is selected for use
   */
  function isSelectedItem(item: Item): boolean {
    return $selectedItem?.id === item.id;
  }

  /**
   * Check if icon is an image path (vs emoji)
   */
  function isImageIcon(icon: string): boolean {
    return icon.startsWith('/') || icon.includes('.png') || icon.includes('.jpg') || icon.includes('.jpeg');
  }

  /**
   * Update cursor based on selected item
   */
  onMount(() => {
    const unsubscribe = selectedItem.subscribe((item) => {
      if (item) {
        if (isImageIcon(item.icon)) {
          // For image icons, use the image as cursor
          document.body.style.cursor = `url('${item.icon}') 16 16, auto`;
        } else {
          // For emoji icons, use SVG with text
          document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text y="24" font-size="24">${item.icon}</text></svg>') 16 16, auto`;
        }
      } else {
        // Reset to default cursor
        document.body.style.cursor = 'default';
      }
    });

    return () => {
      unsubscribe();
      document.body.style.cursor = 'default';
    };
  });
</script>

<div class="inventory">
  <h2 class="inventory-title">Inventário</h2>

  {#if $inventory.length === 0}
    <p class="empty-message">Nenhum item coletado</p>
  {:else}
    <div class="items-grid">
      {#each $inventory as item (item.id)}
        <button
          class="item"
          class:selected={isSelectedItem(item)}
          class:combination={isCombinationItem(item)}
          onclick={(e) => handleItemClick(item, e)}
          title={item.name}
        >
          <div class="item-icon">
            {#if isImageIcon(item.icon)}
              <img src={item.icon} alt={item.name} class="item-icon-image" />
            {:else}
              {item.icon}
            {/if}
            {#if item.quantity && item.quantity > 1}
              <span class="item-quantity">{item.quantity}</span>
            {/if}
          </div>
          <div class="item-name">{item.name}</div>
        </button>
      {/each}
    </div>
  {/if}

  <div class="instructions">
    <p>Click: selecionar</p>
    <p>Shift+Click: combinar</p>
  </div>
</div>

<style>
  .inventory {
    padding: 0;
    color: #ffffff;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .inventory-title {
    font-size: 24px;
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

  @media (max-width: 1200px) {
    .inventory-title {
      font-size: 20px;
      margin-bottom: 16px;
      letter-spacing: 1px;
    }
  }

  @media (max-width: 900px) {
    .inventory-title {
      font-size: 18px;
      margin-bottom: 12px;
    }
  }

  .empty-message {
    color: #b388ff;
    text-align: center;
    font-style: italic;
    margin-top: 32px;
    font-size: 14px;
    opacity: 0.7;
  }

  .items-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
  }

  .items-grid::-webkit-scrollbar {
    width: 8px;
  }

  .items-grid::-webkit-scrollbar-track {
    background: rgba(10, 0, 21, 0.5);
    border-radius: 4px;
  }

  .items-grid::-webkit-scrollbar-thumb {
    background: #ff5e00;
    border-radius: 4px;
  }

  .items-grid::-webkit-scrollbar-thumb:hover {
    background: #ff8c5a;
  }

  .item {
    background: linear-gradient(135deg, rgba(26, 10, 35, 0.9) 0%, rgba(10, 5, 20, 0.9) 100%);
    border: 2px solid #8a2be2;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(138, 43, 226, 0.2);
  }

  .item:hover {
    background: linear-gradient(135deg, rgba(26, 10, 35, 1) 0%, rgba(10, 5, 20, 1) 100%);
    border-color: #ff5e00;
    box-shadow:
      0 4px 12px rgba(255, 94, 0, 0.4),
      0 0 20px rgba(138, 43, 226, 0.3);
    transform: translateX(-4px);
  }

  .item.selected {
    background: linear-gradient(135deg, rgba(255, 94, 0, 0.3) 0%, rgba(255, 94, 0, 0.2) 100%);
    border-color: #ff5e00;
    box-shadow:
      0 4px 16px rgba(255, 94, 0, 0.6),
      0 0 30px rgba(255, 94, 0, 0.4);
    transform: scale(1.02);
  }

  .item.combination {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0.2) 100%);
    border-color: #b388ff;
    box-shadow:
      0 4px 16px rgba(138, 43, 226, 0.6),
      0 0 30px rgba(138, 43, 226, 0.4);
    transform: scale(1.02);
  }

  .item-icon {
    font-size: 32px;
    line-height: 1;
    filter: drop-shadow(0 0 8px rgba(255, 94, 0, 0.5));
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .item-quantity {
    position: absolute;
    bottom: -4px;
    right: -4px;
    background: #ff5e00;
    color: #ffffff;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 8px;
    border: 2px solid #1a0a23;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    min-width: 18px;
    text-align: center;
  }

  .item-icon-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 1200px) {
    .item-icon {
      font-size: 28px;
      width: 36px;
      height: 36px;
    }
  }

  .item-name {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    flex: 1;
    text-shadow: 0 0 10px rgba(255, 94, 0, 0.3);
  }

  @media (max-width: 1200px) {
    .item-name {
      font-size: 13px;
    }
  }

  @media (max-width: 900px) {
    .item-name {
      font-size: 12px;
    }
  }

  .instructions {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px solid rgba(138, 43, 226, 0.3);
    font-size: 11px;
    color: #b388ff;
    text-align: center;
  }

  @media (max-width: 900px) {
    .instructions {
      font-size: 10px;
      margin-top: 12px;
      padding-top: 12px;
    }
  }

  .instructions p {
    margin: 4px 0;
    opacity: 0.8;
  }
</style>
