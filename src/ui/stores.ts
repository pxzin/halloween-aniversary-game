import { writable } from 'svelte/store';

/**
 * Item interface
 */
export interface Item {
  id: string;
  name: string;
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
 * Starting at 23:59:00 = 1 minute until game over
 */
export const INITIAL_TIME: GameTime = {
  hour: 23,
  minute: 59,
  second: 0
};

/**
 * Inventory store - holds array of collected items
 */
export const inventory = writable<Item[]>([]);

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
