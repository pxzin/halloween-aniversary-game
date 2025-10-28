# Task 012: Implement Stairs and Balcony Scenes

## Objective

To implement the `StairsScene` and `BalconyScene`, including their backgrounds, interactive elements, and associated dialogue, allowing the player to navigate between these two areas and find the `miniature rake`.

## Requirements

### 1. Create `StairsScene.ts`

-   Create a new Phaser scene file at `src/game/scenes/StairsScene.ts`.
-   **Backgrounds:**
    *   Load and display `public/assets/images/backgrounds/stairs_door_closed.png` as the initial background.
    *   When the `Hallway Key` is used on the door, the background should switch to `public/assets/images/backgrounds/stairs_door_open.png`.
-   **Interactive Elements:**
    *   **Millipedes:** Create multiple interactive zones over the millipedes on the stairs. Clicking them should:
        *   Play a squishing sound effect (use a placeholder for now).
        *   Make the millipede disappear.
        *   Trigger the `millipede_squish` dialogue from `src/game/data/dialogues/stairs.json`.
    *   **Balcony Door:** Create an interactive zone over the balcony door. Clicking it should transition the game to the `BalconyScene`.
    *   **Hallway Door:** Create an interactive zone over the hallway door.
        *   If the `Hallway Key` is NOT in the player's inventory, clicking it should trigger the `hallway_door_locked` dialogue from `src/game/data/dialogues/stairs.json`.
        *   If the `Hallway Key` IS in the player's inventory, using the key on the door should:
            *   Consume the `Hallway Key` from the inventory.
            *   Switch the background to `stairs_door_open.png`.
            *   Transition the game to the `HallwayScene` (to be implemented in a later task).

### 2. Create `BalconyScene.ts`

-   Create a new Phaser scene file at `src/game/scenes/BalconyScene.ts`.
-   **Background:** Load and display `public/assets/images/backgrounds/balcony.png` as the background.
-   **Interactive Elements:**
    *   **Plant Pots:** Create multiple interactive zones over the plant pots.
        *   One specific pot should contain the `miniature_rake` item. Clicking this pot should:
            *   Add the `miniature_rake` to the player's inventory.
            *   Trigger the `found_rake` dialogue from `src/game/data/dialogues/balcony.json`.
            *   Make the rake visually disappear from the pot.
        *   Other pots should trigger the `empty_pot` dialogue from `src/game/data/dialogues/balcony.json`.
    *   **Return to Stairs:** Create an interactive zone (e.g., over the door leading back inside) that transitions the game back to the `StairsScene`.

### 3. Dialogue Integration

-   Ensure all specified dialogues from `src/game/data/dialogues/stairs.json` and `src/game/data/dialogues/balcony.json` are correctly triggered and displayed using the `DialogueManager` (from Task 004).

## Expected Outcome

-   The game can transition between `FachadaScene`, `StairsScene`, and `BalconyScene`.
-   Millipedes in `StairsScene` are interactive.
-   The `miniature_rake` can be found and added to the inventory from `BalconyScene`.
-   The hallway door in `StairsScene` correctly responds to the presence/absence of the `Hallway Key`.
-   All associated dialogues are displayed correctly.
