# Task 017: Implement Ric's Cheese Safe Puzzle

## Objective

To implement the `Ric's Cheese Safe` puzzle (`Puzzle 10`), which spans the `BackyardScene` and `BathroomScene`, allowing the player to find the `Cheese` gift.

## Requirements

### 1. Update `BackyardScene.ts`

-   **Ric's Diary:**
    *   Create an interactive zone in the backyard (e.g., on a shelf) for `Ric's Diary`.
    *   Clicking it should add `rics_diary` to the player's inventory and trigger the `found_rics_diary` dialogue from `src/game/data/dialogues/backyard.json`.

### 2. Update `BathroomScene.ts`

-   **Small Safe:**
    *   The safe is already visible in the background image. Create an interactive zone over it.
    *   Clicking this zone should trigger the `found_safe` dialogue and open the `Safe.svelte` UI pop-up.

### 3. Create `Safe.svelte` Component

-   Develop a new Svelte component for the safe puzzle UI at `src/ui/components/Safe.svelte`.
-   **Visuals:**
    *   It should display the close-up image of the safe's input panel (`public/assets/images/ui/safe_closeup.png`).
    *   It must have an input area for a sequence of geometric symbols.
    *   Include a confirm/unlock button.
-   **Puzzle Logic:**
    *   The component will handle the puzzle's logic.
    *   **Input:** The player uses the UI to set a sequence of geometric symbols.
    *   **Validation:** When the confirm button is pressed, the entered sequence is checked against the correct solution (to be defined by the user).
    *   **On Success:**
        *   If the sequence is correct, the safe UI should close.
        *   An event (e.g., `safe_unlocked`) should be dispatched via the `EventBus`.
        *   The `BathroomScene` will listen for this event and make the `Cheese` item visible and clickable.
    *   **On Failure:**
        *   If the sequence is incorrect, the UI should remain on-screen, allowing the player to try again.

### 4. Dialogue Integration

-   Ensure all specified dialogues from `src/game/data/dialogues/bathroom.json` are correctly triggered and displayed using the `DialogueManager`.

## Expected Outcome

-   The player can find `Ric's Diary` in the `BackyardScene`.
-   The player can interact with the safe in the `BathroomScene`.
-   The `Safe.svelte` UI works as expected.
-   Solving the puzzle leads to the acquisition of the `Cheese`.
-   All associated dialogues are displayed correctly.
