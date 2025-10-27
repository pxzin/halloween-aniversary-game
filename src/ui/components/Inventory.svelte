<script lang="ts">
  import { onMount } from 'svelte';
  import { inventory, selectedItem, combinationStore } from '../stores';
  import { CombinationService } from '../../game/services/CombinationService';
  import type { Item } from '../stores';

  /**
   * Handle item click
   * - If holding Shift: select for combination
   * - Otherwise: select for use in scene
   */
  function handleItemClick(item: Item, event: MouseEvent) {
    if (event.shiftKey) {
      // Shift-click: combination mode
      const firstItem = $combinationStore;

      if (!firstItem) {
        // This is the first item for combination
        combinationStore.set(item);
      } else {
        // This is the second item, attempt combination
        const result = CombinationService.combine(firstItem, item);

        if (result) {
          console.log(`Combined ${firstItem.name} + ${item.name} = ${result.name}`);
        } else {
          console.log(`Cannot combine ${firstItem.name} + ${item.name}`);
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
   * Update cursor based on selected item
   */
  onMount(() => {
    const unsubscribe = selectedItem.subscribe((item) => {
      if (item) {
        // Set custom cursor with item icon
        document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text y="24" font-size="24">${item.icon}</text></svg>') 16 16, auto`;
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
          <div class="item-icon">{item.icon}</div>
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
    padding: 16px;
    color: #ffffff;
  }

  @media (max-width: 1200px) {
    .inventory {
      padding: 12px;
    }
  }

  @media (max-width: 900px) {
    .inventory {
      padding: 10px;
    }
  }

  .inventory-title {
    font-size: 20px;
    font-weight: bold;
    color: #ff6b35;
    margin-bottom: 16px;
    text-align: center;
  }

  .empty-message {
    color: #888;
    text-align: center;
    font-style: italic;
    margin-top: 32px;
  }

  .items-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .item {
    background-color: #3d3d3d;
    border: 2px solid #555;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .item:hover {
    background-color: #4d4d4d;
    border-color: #ff6b35;
  }

  .item.selected {
    background-color: #ff6b35;
    border-color: #ff8c5a;
  }

  .item.combination {
    background-color: #35a7ff;
    border-color: #5ab8ff;
  }

  .item-icon {
    font-size: 28px;
    line-height: 1;
  }

  .item-name {
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
    flex: 1;
  }

  .instructions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #555;
    font-size: 12px;
    color: #888;
  }

  .instructions p {
    margin: 4px 0;
  }
</style>
