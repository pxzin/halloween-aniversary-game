import { inventory, selectedItem } from '../../ui/stores';
import type { Item } from '../../ui/stores';
import { EventBus } from '../EventBus';
import { get } from 'svelte/store';

/**
 * Valid interaction definition
 */
interface Interaction {
  itemId: string;
  objectId: string;
  event: string; // Event to emit when interaction succeeds
  consumeItem?: boolean; // Whether to remove the item from inventory (default: true)
}

/**
 * Interaction Service - handles item-to-object interactions
 */
class InteractionServiceClass {
  private interactions: Interaction[] = [
    // Example interactions - will be expanded in future tasks
    {
      itemId: 'lighter',
      objectId: 'grill_with_sanitizer',
      event: 'grill_lit',
      consumeItem: true
    }
  ];

  /**
   * Attempt to use an item on an object
   * Returns true if the interaction was valid, false otherwise
   */
  useItemOnObject(item: Item, objectId: string): boolean {
    // Find a matching interaction
    const interaction = this.interactions.find(
      i => i.itemId === item.id && i.objectId === objectId
    );

    if (!interaction) {
      // No valid interaction found
      EventBus.emit('show-dialogue', {
        character: 'jessica',
        text: 'Isso não funciona aqui...'
      });
      return false;
    }

    // Valid interaction found!
    // Emit the event for the scene to handle
    EventBus.emit(interaction.event);

    // Remove the item from inventory if consumeItem is true
    if (interaction.consumeItem !== false) {
      inventory.update(items => items.filter(i => i.id !== item.id));
    }

    // Clear selected item
    selectedItem.set(null);

    return true;
  }

  /**
   * Add a new interaction to the service
   */
  addInteraction(interaction: Interaction): void {
    this.interactions.push(interaction);
  }

  /**
   * Get all interactions (for debugging)
   */
  getInteractions(): Interaction[] {
    return this.interactions;
  }
}

// Export singleton instance
export const InteractionService = new InteractionServiceClass();
