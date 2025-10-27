# Task 009: Implement Main Menu and Apply Theme

## Objective

To create a functional main menu screen that displays the game logo and provides a "New Game" option. This task also serves as the first practical application of the global theme (colors, fonts) defined in `uno.config.ts`.

## Requirements

1.  **Asset Location:** The new game logo will be located at `public/assets/images/ui/logo.png`.

2.  **Create `MainMenu.svelte` Component:**
    *   This new Svelte component will serve as the main menu.
    *   It should be displayed by the `GUI.svelte` component when the game is in the `MainMenuScene` state.

3.  **Display Logo and Options:**
    *   The `MainMenu.svelte` component should prominently display the game logo (`/assets/images/ui/logo.png`) at the top of the screen.
    *   Below the logo, it should have at least one button: "Novo Jogo".
    *   A second, non-functional "Opções" button can also be added as a placeholder.

4.  **Apply Global Theme:**
    *   The background of the main menu should be styled using the dark Halloween colors from the `uno.config.ts` theme (e.g., `halloween-dark`).
    *   All text and buttons must use the `font-game` family defined in the theme.
    *   Buttons should be styled using the theme's `halloween-orange` and `halloween-purple` for backgrounds, borders, or hover effects.

5.  **Connect to Scene Manager:**
    *   Clicking the "Novo Jogo" button must trigger the `start-game` event via the `EventBus`, which will instruct the `MainMenuScene` in Phaser to transition to the `IntroScene`.

## Expected Outcome

-   When the game starts, a main menu is displayed with the game's logo and a "Novo Jogo" button.
-   The menu correctly uses the fonts and colors specified in the `uno.config.ts` file.
-   Clicking "Novo Jogo" successfully starts the game by transitioning to the `IntroScene`.
