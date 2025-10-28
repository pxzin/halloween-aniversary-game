# Task 011: Implement Façade Scene and Padlock Puzzle

## Objective

To create the first interactive scene of the game (`FachadaScene`), which includes the background, a clickable gate that triggers a puzzle, and the implementation of the 4-digit padlock puzzle UI.

## Requirements

### 1. Create `FachadaScene.ts`

-   Create a new Phaser scene file at `src/game/scenes/FachadaScene.ts`.
-   This scene should load and display the main façade background image (e.g., `public/assets/images/backgrounds/facade.png`).
-   Update the game's scene manager to transition from the `IntroScene` to this `FachadaScene`.

### 2. Implement Clickable Gate

-   Within `FachadaScene.ts`, create an invisible Phaser GameObject (a Zone) that covers the gate area of the background image.
-   Make this zone interactive. When clicked, it should trigger the display of the padlock puzzle UI.

### 3. Create `Padlock.svelte` Component

-   Develop a new Svelte component for the padlock puzzle UI at `src/ui/components/Padlock.svelte`.
-   This component should appear as a modal or pop-up over the game screen.
-   **Visuals:**
    -   It should display the close-up image of the padlock (`public/assets/images/ui/padlock_closeup.png`).
    -   It must have an input area for a 4-digit code, visually styled to look like the dials of a combination lock (e.g., with up/down arrows to cycle through numbers 0-9 for each digit).
    -   Include a confirm/unlock button.

### 4. Puzzle Logic

-   The `Padlock.svelte` component will handle the puzzle's logic.
-   **Input:** The player uses the UI to set a 4-digit code.
-   **Validation:** When the confirm button is pressed, the entered code is checked against the valid solutions from the GDD (`2531` or `9393`).
-   **On Success:**
    -   If the code is correct, the padlock UI should close.
    -   An event (e.g., `gate_unlocked`) should be dispatched via the `EventBus`.
    -   The `FachadaScene` will listen for this event and trigger the transition to the next scene (`StairsScene`).
-   **On Failure:**
    -   If the code is incorrect, the UI should remain on-screen, allowing the player to try again. No other action is required, but a subtle "incorrect" sound effect can be triggered.

## Expected Outcome

-   The game transitions to the `FachadaScene` after the intro.
-   The façade background is displayed.
-   Clicking on the gate area opens the `Padlock.svelte` UI pop-up.
-   The player can input a 4-digit code.
-   Entering an incorrect code does nothing but allow for another attempt.
-   Entering a correct code closes the pop-up and transitions the game to the next scene.
