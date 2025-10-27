# Task 010: UI Layout and Decorative Element Adjustments

## Objective

To refine the main UI by adjusting the game stage aspect ratio to 16:9 and repositioning animated decorative elements to the background layer to avoid overlapping with the gameplay area.

## Requirements

### 1. Adjust Game Stage to 16:9

-   **Phaser Configuration:** In the main Phaser game configuration (`src/game/Game.ts` or similar), update the game's resolution to a standard 16:9 format (e.g., 1280x720).
-   **CSS Layout:** In the main Svelte layout component (`GUI.svelte` or where the `.game-view` is styled), ensure the container for the Phaser canvas is adjusted to correctly fit the new 16:9 aspect ratio within the overall UI layout.

### 2. Reposition Decorative Elements

-   **Analyze `GUI.svelte`:** Identify the components or elements responsible for rendering the floating `bat` (🦇) and `ghost` (👻) animations.
-   **Adjust `z-index`:** Modify the CSS for these elements to ensure they have a `z-index` that places them *behind* the main game view (`.game-view`) but still visible over the absolute background. They should behave similarly to the `.pumpkin-bg` elements, creating a layered background effect without obstructing the game.

### 3. Add Spider Web Decorations

-   **Create Static Decorations:** Add new, non-animated spider web elements (e.g., using the `🕸️` emoji or an SVG) to the UI.
-   **Positioning:** These spider webs should be positioned in the four corners of the main `.game-container`, fixed in place to frame the entire UI.

## Expected Outcome

-   The main gameplay area (the Phaser canvas) renders correctly in a 16:9 aspect ratio.
-   The floating bat and ghost animations no longer pass in front of the game stage, instead appearing as part of the background layers.
-   Static spider web decorations are visible in the corners of the game's container, enhancing the Halloween theme.
