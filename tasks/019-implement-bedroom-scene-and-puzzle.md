# Task 019: Implement Bedroom Scene and Hand Gesture Puzzle

## Objective

To implement the `BedroomScene` (`Cenário 10`) and the `Hand Gesture Enigma` puzzle (`Puzzle 08`), allowing the player to find the `Clothes` gift.

## Requirements

### 1. Create `BedroomScene.ts`

-   Create a new Phaser scene file at `src/game/scenes/BedroomScene.ts`.
-   **Backgrounds:**
    *   Load and display `public/assets/images/backgrounds/bedroom_view1.png` as the initial background.
    *   Implement a mechanism to switch to a close-up view of the closets (`bedroom_view2.png`) when the player interacts with the closet area.
-   **Navigation:**
    *   The scene should be accessible from the `KitchenScene`.
    *   Create an interactive zone to return to the `KitchenScene`.

### 2. Implement Hand Gesture Enigma (`Puzzle 08`)

-   **Old Note:**
    *   In the main view (`bedroom_view1.png`), create an interactive zone over the `old note`.
    *   Clicking it should add `old_note` to the player's inventory and trigger the `found_old_note` dialogue.
-   **Wardrobe:**
    *   Create an interactive zone over the large wardrobe.
    *   If the wardrobe is locked, clicking it should trigger the `wardrobe_locked` dialogue.
-   **Closet View (Puzzle UI):**
    *   In the closet view (`bedroom_view2.png`), create three interactive hotspots corresponding to the hand gestures (🤌, 🫰, 😘).
    *   The player must click these hotspots in the correct sequence.
    *   **On Success:**
        *   Trigger the `wardrobe_unlocked` dialogue.
        *   Make the wardrobe in the main view appear open.
        *   Reveal the `Clothes` gift inside the wardrobe.
    *   **On Failure:**
        *   If the sequence is incorrect, a subtle "wrong" sound effect should play, and the sequence resets.
-   **Clothes Gift:**
    *   Once the wardrobe is open, clicking the `Clothes` gift should:
        *   Add `clothes` to the player's inventory.
        *   Trigger the `found_clothes` dialogue.
        *   Make the `Clothes` visually disappear from the scene.

### 3. Dialogue Integration

-   Ensure all specified dialogues from `src/game/data/dialogues/bedroom.json` are correctly triggered and displayed using the `DialogueManager`.

## Expected Outcome

-   The player can navigate to and from the `BedroomScene`.
-   The `Hand Gesture Enigma` puzzle can be fully completed, leading to the acquisition of the `Clothes` gift.
-   All associated dialogues are displayed correctly.
