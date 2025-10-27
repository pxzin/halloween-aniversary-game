# Task 008: Refactor UI with Persona-5-Inspired Halloween Theme

## Objective

To completely refactor the game's user interface based on the new proof-of-concept (POC) file. This involves translating the HTML structure and CSS styles from the POC into our project's Svelte and UnoCSS stack to create a highly stylized, modern, and animated UI.

## Reference Material

-   **Primary Reference:** `public/assets/images/ui/halloween_dialogue_gui.html`

## Requirements

### 1. Analyze and Deconstruct the POC

-   The primary goal is to replicate the aesthetic and layout of the POC file using our existing component structure (`GUI.svelte`, `Clock.svelte`, `Inventory.svelte`, `DialogueBox.svelte`).
-   The POC's CSS is the main source of truth for colors, fonts, animations, and layout. This needs to be translated to UnoCSS.

### 2. UnoCSS Configuration

-   Update the UnoCSS configuration to include the key design tokens from the POC:
    -   **Colors:** Add the primary orange (`#ff5e00`) and purple (`#8a2be2`) to the theme.
    -   **Fonts:** Ensure the font family `'Arial Black', 'Arial Bold', Gadget, sans-serif` is available.

### 3. Component-by-Component Refactoring

-   **`GUI.svelte` (Main Layout):**
    -   Re-implement the main layout to match the POC's structure, including the `.game-container`, `.game-view`, and the positioning of the other UI elements.

-   **`Clock.svelte`:**
    -   Re-style the component to match the `.timer-bar` and `.timer` classes. This includes the gradient background, border, font styles, text shadows, and the pulsing animation.
    -   Incorporate the `🎃` icons.

-   **`Inventory.svelte`:**
    -   Re-style to match the `.inventory-panel`. Implement the gradient background, border, and padding.
    -   Replicate the skewed title (`.inventory-title`) and the stylized instruction box.

-   **`DialogueBox.svelte`:**
    -   This is the most complex component. It needs to be rebuilt to match the POC's layout, which includes a large portrait area on the left and the dialogue box on the right.
    -   Implement the complex styles for the dialogue box itself (`.dialogue-box`), including the gradient, border, box-shadow, `clip-path`, and skew transform.
    -   Re-create the animated border effect (`.dialogue-box::before`).
    -   Re-create the character nameplate (`.character-name`) and the continue indicator (`.continue-indicator`).
    -   The character portrait area (`.character-portrait`) must be styled with its specific border, shadow, and `clip-path`.

### 4. General Styling and Animation

-   Translate all keyframe animations (`float`, `pulse`, `gradientShift`, `webSway`, `bounceGlow`, `slideIn`) from the POC's CSS into the UnoCSS configuration or use appropriate utility classes.
-   The decorative elements (floating pumpkins, bats, ghosts, web decorations) should be implemented as separate, reusable Svelte components and placed in the main `GUI.svelte` layout to create the ambient animated background.

## Expected Outcome

-   The game's UI is transformed from a basic layout to the highly stylized, Persona-5-inspired Halloween theme defined in the POC.
-   All major UI components (Clock, Inventory, Dialogue Box, Portrait) are visually and functionally identical to the POC.
-   The UI is responsive and correctly structured using Svelte components and UnoCSS.
-   The logic and state management from previous tasks (e.g., `DialogueManager`, Svelte stores) are correctly integrated with the new UI.
