# Task 018: Implement Final Puzzle in the Office

## Objective

To implement the `OfficeScene` (`Cenário 7`) and the final puzzle, `The Pentagram of the Curse`, where the player uses the five collected gifts to break the curse and finish the game.

## Requirements

### 1. Create `OfficeScene.ts`

-   Create a new Phaser scene file at `src/game/scenes/OfficeScene.ts`.
-   **Background:** Load and display `public/assets/images/backgrounds/office.png`.
-   **Scene Access:**
    *   The door to the `OfficeScene` (from the `LivingRoomScene`) should only become interactive and lead to this scene *after* the player has all five gifts in their inventory.

### 2. Implement Pentagram and Rhyme Battle Puzzle

-   **Pentagram Interaction:**
    *   Create a large interactive zone over the pentagram area on the floor.
    *   The player must use each of the five gift items on a specific hotspot of the pentagram.
-   **Ritual and Rhyme Battle:**
    *   Once all five gifts are placed correctly, the pentagram should glow, and the `curse_breaking` dialogue sequence from `src/game/data/dialogues/office.json` should begin.
    *   This sequence will involve a special UI for the 5-turn rhyme battle.
    *   For each of Jéssica's five lines in the rhyme battle, the game should present the player with three choices, where only one is correct.
    *   After the dialogue and visual effects conclude, the game should transition to the final "Happy Birthday" screen.

### 3. Game Conclusion

-   After the final dialogue in the `OfficeScene` concludes, the screen should fade to black.
-   A new, simple UI screen should fade in, displaying the following text:
    *   **Title:** "Feliz Aniversário, meu amor!"
    *   **Body:** "Para a Jéssica,\nCada momento com você é um presente. Esta é só uma pequena forma de celebrar o seu dia. Obrigado por tanto. Feliz aniversário, meu amor!!\nCom todo o meu carinho,\nRic"
-   This screen marks the end of the game.

### 4. Dialogue Integration

-   Ensure all specified dialogues from `src/game/data/dialogues/office.json` are correctly triggered and displayed using the `DialogueManager`.

## Expected Outcome

-   The `OfficeScene` is only accessible after collecting all five gifts.
-   The player can interact with the pentagram and place the five gifts on it.
-   Placing all gifts correctly triggers the final cutscene and dialogue.
-   The game reaches its conclusion upon solving the final puzzle.
