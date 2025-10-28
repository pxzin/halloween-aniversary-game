import { writable } from 'svelte/store';

/**
 * Item interface
 */
export interface Item {
  id: string;
  name: string;
  icon: string; // Emoji or image path for the item
}

/**
 * Dialogue interface
 */
export interface Dialogue {
  character: string;
  text: string;
}

/**
 * Game time interface - represents in-game time
 */
export interface GameTime {
  hour: number;
  minute: number;
  second: number;
}

/**
 * Initial game time - easy to modify for testing
 * Game over happens at midnight (00:00:00)
 * Starting at 23:00:00 = 1 hour until game over
 */
export const INITIAL_TIME: GameTime = {
  hour: 23,
  minute: 0,
  second: 0
};

/**
 * Inventory store - holds array of collected items
 * Jessica always starts with a lighter and a special cigarette
 */
export const inventory = writable<Item[]>([
  { id: 'lighter', name: 'Isqueiro', icon: '🔥' },
  { id: 'weed_joint', name: 'Ponta de Erva Boa', icon: '🌿' }
]);

/**
 * Game time store - current in-game time
 */
export const gameTime = writable<GameTime>({ ...INITIAL_TIME });

/**
 * Dialogue store - current dialogue to display
 */
export const dialogue = writable<Dialogue | null>(null);

/**
 * Selected item store - item selected for use in scene
 */
export const selectedItem = writable<Item | null>(null);

/**
 * Combination store - first item selected for combination
 */
export const combinationStore = writable<Item | null>(null);

/**
 * Game over store - tracks if game is over
 */
export const isGameOver = writable<boolean>(false);

/**
 * Inventory visibility store - controls whether inventory panel is visible
 * Hidden during INTRO scene to prevent premature item usage
 */
export const inventoryVisible = writable<boolean>(true);
