import { inventory } from '../../ui/stores';
import type { Item } from '../../ui/stores';
import { get } from 'svelte/store';

/**
 * Recipe for item combinations
 */
interface Recipe {
  ingredients: string[]; // IDs of the two items needed
  result: Item; // The resulting item
}

/**
 * Combination Service - handles item-to-item combinations
 */
class CombinationServiceClass {
  private recipes: Recipe[] = [
    // Example recipes - will be expanded in future tasks
    {
      ingredients: ['cat_food_can', 'mini_rake'],
      result: { id: 'open_cat_food_can', name: 'Lata de Ração Aberta' }
    }
  ];

  /**
   * Attempt to combine two items
   * Returns the resulting item if successful, null otherwise
   */
  combine(item1: Item, item2: Item): Item | null {
    // Try to find a matching recipe
    const recipe = this.recipes.find(r => {
      const ingredients = r.ingredients.sort();
      const items = [item1.id, item2.id].sort();
      return ingredients[0] === items[0] && ingredients[1] === items[1];
    });

    if (!recipe) {
      return null;
    }

    // Remove the two items from inventory
    inventory.update(items => {
      return items.filter(item =>
        item.id !== item1.id && item.id !== item2.id
      );
    });

    // Add the resulting item to inventory
    inventory.update(items => [...items, recipe.result]);

    return recipe.result;
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
