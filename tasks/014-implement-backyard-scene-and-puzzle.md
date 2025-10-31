# Task 014: Implement Backyard Scene and Cat's Treasure Puzzle

## Objective

To implement the `BackyardScene` (`Cenário 5`), including its background, interactive elements, and the multi-step `Cat's Treasure` puzzle (`Puzzle 04`) to obtain the `Living Room Key`.

## Requirements

### 1. Create `BackyardScene.ts`

-   Create a new Phaser scene file at `src/game/scenes/BackyardScene.ts`.
-   **Background:** Load and display `public/assets/images/backgrounds/backyard.png`.
-   **Navigation:**
    *   The scene should be accessible from the `HallwayScene`.
    *   Create an interactive zone to return to the `HallwayScene`.

### 2. Implement Cat's Treasure Puzzle (`Puzzle 04`)

-   **Interactive Elements:**
    *   **Hand Sanitizer:** Create an interactive zone over the hand sanitizer above the washing machine. Clicking it adds `hand_sanitizer` to inventory and makes it disappear.
    *   **Barbecue Grill:** Create an interactive zone over the grill.
        *   Using `hand_sanitizer` on the grill changes its state (e.g., `grill_with_sanitizer`).
        *   Using `lighter` on `grill_with_sanitizer` triggers `grill_lit` dialogue and changes the scene's lighting/visuals to reflect it being lit.
    *   **Cat on Shelf:** Create an interactive zone over the cat on the high shelf.
        *   If the grill is not lit, clicking it triggers `cat_on_shelf` dialogue.
        *   If the grill is lit, it reveals the cat is guarding something.
    *   **Cat Food Can:** Create an interactive zone over the cat food can in the cabinets. Clicking it adds `cat_food_can` to inventory and makes it disappear.
    *   **Table:** Create an interactive zone over the central table.
        *   Using `open_cat_food_can` on the table triggers `cat_lured` dialogue and makes the cat move away from the shelf.
    *   **Living Room Key:** Once the cat is lured away, the `Living Room Key` should be accessible on the shelf.
        *   Using `broom` on the shelf (after cat is lured) makes the key fall.
        *   Clicking the fallen key adds `living_room_key` to inventory and makes it disappear.

### 3. Dialogue Integration

-   Ensure all specified dialogues from `src/game/data/dialogues/backyard.json` are correctly triggered and displayed using the `DialogueManager`.

## Expected Outcome

-   The player can navigate to and from the `BackyardScene`.
-   The `Cat's Treasure` puzzle can be fully completed, leading to the acquisition of the `Living Room Key`.
-   All associated dialogues are displayed correctly.
