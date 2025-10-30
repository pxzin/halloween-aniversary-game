# Task 016: Implement Frozen Treasure Puzzle (Chocolates)

## Objective

To implement the `Frozen Treasure` puzzle (`Puzzle 09`) in the `KitchenScene`, allowing the player to find the `Chocolates` gift.

## Requirements

### 1. Update `KitchenScene.ts`

-   **Freezer Interaction:**
    *   In the freezer compartment, create multiple interactive zones for the `ice keys`.
    *   Each time the player clicks an `ice key`, it should be removed from the scene.
    *   Once all `ice keys` are removed, the `Chocolates` item should become visible and clickable.
-   **Chocolates Item:**
    *   Clicking the `Chocolates` item should:
        *   Add `chocolates` to the player's inventory.
        *   Trigger the `found_chocolates` dialogue from `src/game/data/dialogues/kitchen.json`.
        *   Make the `Chocolates` visually disappear from the scene.

### 2. Dialogue Integration

-   Ensure all specified dialogues from `src/game/data/dialogues/kitchen.json` are correctly triggered and displayed using the `DialogueManager`.

## Expected Outcome

-   The player can interact with the freezer in the `KitchenScene`.
-   Removing all `ice keys` reveals the `Chocolates`.
-   The `Chocolates` can be collected and added to the inventory.
-   All associated dialogues are displayed correctly.
