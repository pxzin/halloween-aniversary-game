# Task 018: Implement Final Puzzle in the Office

## Objective

To implement the `OfficeScene` (`Cenário 7`) and the final puzzle, `The Pentagram of the Curse`, where the player uses the five collected gifts to break the curse and finish the game.

## Requirements

### 1. Create `OfficeScene.ts`

-   Create a new Phaser scene file at `src/game/scenes/OfficeScene.ts`.
-   **Background:** Load and display `public/assets/images/backgrounds/office.png`.
-   **Scene Access:**
    *   The door to the `OfficeScene` (from the `LivingRoomScene`) should only become interactive and lead to this scene *after* the player has all five gifts in their inventory.

### 2. Implement Pentagram Puzzle

-   **Pentagram Interaction:**
    *   Create a large interactive zone over the pentagram area on the floor.
    *   When the player first interacts with it, trigger the `pentagram_interaction` dialogue.
    *   The pentagram should have five distinct interactive points (hotspots), one for each point of the star.
-   **Placing Gifts:**
    *   The player must use each of the five gift items from their inventory on the correct hotspot of the pentagram.
    *   When a gift is placed correctly, it should appear visually on the pentagram.
    *   If a gift is placed incorrectly, a subtle "wrong" sound effect should play.
-   **Ritual Sequence:**
    *   Once all five gifts are placed correctly, trigger the `curse_breaking` dialogue sequence.
    *   During this sequence, add visual effects (e.g., the pentagram glowing, the owl appearing and disappearing) to enhance the cinematic feel.

### 3. Game Conclusion

-   After the `curse_breaking` dialogue and visual effects conclude, the game should transition to a final "Happy Birthday" screen or a concluding cutscene, as defined in the GDD.

### 4. Dialogue Integration

-   Ensure all specified dialogues from `src/game/data/dialogues/office.json` are correctly triggered and displayed using the `DialogueManager`.

## Expected Outcome

-   The `OfficeScene` is only accessible after collecting all five gifts.
-   The player can interact with the pentagram and place the five gifts on it.
-   Placing all gifts correctly triggers the final cutscene and dialogue.
-   The game reaches its conclusion upon solving the final puzzle.
