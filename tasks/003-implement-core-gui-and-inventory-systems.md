# Task 003: Implement Core GUI and Inventory Systems

## Objective

Based on the approved design, this task is to build the main graphical user interface (GUI) components and the underlying systems for inventory management and item combination. This forms the core of how the player will interact with the game world.

## Requirements

### 1. Global State Management (Svelte Stores)

-   Create a new file `src/ui/stores.ts`.
-   This file will manage the game's state using Svelte stores.
-   Implement the following stores:
    -   `inventory`: A writable store that holds an array of item objects (e.g., `{ id: 'lighter', name: 'Isqueiro' }`).
    -   `gameTime`: A writable store holding the remaining time in seconds.
    -   `dialogue`: A writable store to hold the current dialogue object (e.g., `{ character: 'jessica', text: 'O que foi isso?' }`).
    -   `selectedItem`: A writable store to hold the inventory item that the player has selected to use on the scene (e.g., `{ id: 'lighter', name: 'Isqueiro' }`).

### 2. Main GUI Layout

-   Create a master `GUI.svelte` component.
-   This component will use CSS Grid or Flexbox to create the main screen layout:
    -   **Top:** A thin bar for the clock.
    -   **Right:** A sidebar for the inventory.
    -   **Bottom:** A larger bar for the dialogue box.
    -   **Center:** The main area where the Phaser canvas will be rendered.

### 3. Clock System

-   Create a `Clock.svelte` component.
-   It should subscribe to the `gameTime` store and display the time in a `MM:SS` format.
-   In `main.ts`, create a `setInterval` that decrements the `gameTime` store every second.
-   If the time reaches zero, it should emit a `game-over` event via the `EventBus`.

### 4. Inventory & Combination System

-   Create an `Inventory.svelte` component.
-   It subscribes to the `inventory` store and displays the list of items.
-   Implement the **item-to-item** combination logic:
    1.  Create a `combinationStore` to hold the first selected item for combination.
    2.  When an item in the inventory is clicked, it's moved to this `combinationStore`.
    3.  If another item is clicked while the `combinationStore` has an item, both items are sent to a new `CombinationService.ts`.
-   Create `src/game/services/CombinationService.ts`:
    -   This service will have a `combine` method for item-to-item interactions.
    -   It will contain a list of valid recipes (e.g., `['cat_food_can', 'mini_rake']`).
    -   If the combination is valid, it removes the two base items from the `inventory` store and adds the resulting item (e.g., `open_cat_food_can`).

### 5. Inventory-to-Scene Interaction

-   **Item Selection:** In `Inventory.svelte`, when an item is clicked, it should be placed in the `selectedItem` store. The cursor should change to indicate an item is selected.
-   **Scene Interaction:** In the Phaser scenes (e.g., `WorldScene.ts`), when a game object is clicked, the scene must check the value of the `selectedItem` store.
    -   If `selectedItem` is `null`, perform the default action (e.g., show a description).
    -   If `selectedItem` is not `null`, it signifies a "use item on object" action.
-   **Interaction Service:** Create a new `src/game/services/InteractionService.ts`.
    -   This service will have a method like `useItemOnObject(item, objectId)`.
    -   It will contain a list of valid interactions (e.g., `item: 'lighter', object: 'grill_with_sanitizer'`).
    -   When a valid interaction occurs, the service will emit an event via the `EventBus` (e.g., `EventBus.emit('grill_lit')`) for the scene to handle, and it will update the inventory (e.g., remove the used item).

### 6. Dialogue System

-   Create a `DialogueBox.svelte` component.
-   It subscribes to the `dialogue` store.
-   When the `dialogue` store is not empty, it displays the character portrait and the text.
-   The `EventBus` will be used to update this store from the Phaser side (`EventBus.on('show-dialogue', (data) => dialogue.set(data))`).

## Expected Outcome

-   The game screen is clearly divided into the game canvas, inventory, dialogue box, and clock areas.
-   A clock ticks down at the top of the screen.
-   Mock items can be added to a global store and are displayed in the inventory sidebar.
-   **Item-to-Item:** Clicking two items in the inventory attempts a combination, with the result correctly updating the inventory.
-   **Item-to-Scene:** Clicking an item in the inventory and then clicking a valid object in the game world triggers a specific interaction.
-   Calling `EventBus.emit('show-dialogue', ...)` correctly displays a message in the dialogue box.
