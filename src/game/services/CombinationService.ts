import { inventory, selectedItem, combinationStore } from '../../ui/stores';
import type { Item } from '../../ui/stores';
import { EventBus } from '../EventBus';
import { DialogueManager } from './DialogueManager';
import { get } from 'svelte/store';

/**
 * Recipe for item combinations
 */
interface Recipe {
  ingredients: string[]; // IDs of the two items needed
  result?: Item; // The resulting item (optional - some combinations trigger events instead)
  keepItems?: string[]; // IDs of items to keep (not remove from inventory)
  onCombine?: () => Promise<void>; // Optional callback for special combinations
}

/**
 * Combination Service - handles item-to-item combinations
 */
class CombinationServiceClass {
  private recipes: Recipe[] = [
    // Cat's Treasure Puzzle - Open cat food can
    {
      ingredients: ['cat_food_can', 'miniature_rake'],
      result: { id: 'open_cat_food_can', name: 'Lata de Ração Aberta', icon: '/assets/images/ui/cat_food_can_open.png' },
      keepItems: ['miniature_rake'] // Keep the rake to use in the bathroom litter box
    },
    // Easter Egg: Lighter + Weed Joint
    {
      ingredients: ['lighter', 'weed_joint'],
      keepItems: ['lighter'], // Keep the lighter, remove only the joint
      onCombine: async () => {
        console.log('[CombinationService] Easter Egg: Smoking weed joint!');
        await DialogueManager.loadScript('easter_egg_weed', 'smoking_sequence');
        DialogueManager.startDialogue();
      }
    }
  ];

  /**
   * Attempt to combine two items
   * Returns the resulting item if successful, null otherwise
   */
  async combine(item1: Item, item2: Item): Promise<Item | null> {
    // Try to find a matching recipe
    const recipe = this.recipes.find(r => {
      const ingredients = r.ingredients.sort();
      const items = [item1.id, item2.id].sort();
      return ingredients[0] === items[0] && ingredients[1] === items[1];
    });

    if (!recipe) {
      return null;
    }

    // Determine which items to remove
    const keepIds = recipe.keepItems || [];
    const itemsToRemove = [item1.id, item2.id].filter(id => !keepIds.includes(id));

    // Remove items that shouldn't be kept
    if (itemsToRemove.length > 0) {
      inventory.update(items => {
        const filtered = [...items];
        itemsToRemove.forEach(idToRemove => {
          const index = filtered.findIndex(item => item.id === idToRemove);
          if (index !== -1) {
            filtered.splice(index, 1);
          }
        });
        return filtered;
      });
    }

    // Execute special callback if present
    if (recipe.onCombine) {
      await recipe.onCombine();
    }

    // Trigger item acquisition animation for the resulting item (if there is one)
    // The animation component will add the item to inventory after the animation completes
    if (recipe.result) {
      EventBus.emit('item-acquired', {
        id: recipe.result.id,
        name: recipe.result.name,
        icon: recipe.result.icon
      });
    }

    // Reset selection stores to clear cursor and combination state
    selectedItem.set(null);
    combinationStore.set(null);

    return recipe.result || null;
  }

  /**
   * Add a new recipe to the service
   */
  addRecipe(recipe: Recipe): void {
    this.recipes.push(recipe);
  }

  /**
   * Get all recipes (for debugging)
   */
  getRecipes(): Recipe[] {
    return this.recipes;
  }
}

// Export singleton instance
export const CombinationService = new CombinationServiceClass();
