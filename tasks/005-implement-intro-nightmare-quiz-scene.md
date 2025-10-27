# Task 005: Implement Intro Nightmare Quiz Scene

## Objective

To develop the game's opening sequence as described in the GDD. This includes the initial narrative cutscene and the interactive "Nightmare Quiz" minigame, which sets up the story.

## Requirements

### 1. Dialogue and Narrative Script

-   **Create `intro.json`:** In the `src/game/data/dialogues/` directory, create a new script file named `intro.json`.
-   This file will contain all the narrative for this scene. It should have separate entries for the opening text, the Owl's curse, and the final fainting sequence. For example:
    ```json
    {
      "opening_narrative": {
        "id": "opening_narrative",
        "lines": [
          { "speaker": "narrator", "text": "Jessica is at home on October 31st..." },
          { "speaker": "jessica_annoyed", "text": "Ugh, Duolingo again?" }
        ]
      },
      "curse_dialogue": {
        "id": "curse_dialogue",
        "lines": [
          { "speaker": "owl_furious", "text": "You have failed! Your soul is forfeit!" }
        ]
      }
    }
    ```

### 2. Intro Cutscene Scene

-   **Create `IntroScene.ts`:** This new Phaser scene will manage the opening sequence. It should be the first scene the game loads after the `BootScene`.
-   **Narrative Display:** Use the **`DialogueManager`** service (from Task 004) to load and display the `opening_narrative` from `intro.json`.
-   **Background:** The background for this scene should be a simple, dark, dream-like texture, with a large smartphone image in the center.

### 3. Quiz Minigame

-   **Create `Quiz.svelte` component:** This Svelte component will be rendered on top of the `IntroScene`.
-   **Quiz Data:** The component will use the pre-existing data from `src/game/data/quizQuestions.ts`.

### 4. Quiz Progression and Climax

-   The quiz follows the 4 phases as detailed in `quizQuestions.ts`.
-   **Climax and Transition:**
    -   After the final "bugged" question, the quiz UI disappears.
    -   The scene will use the **`DialogueManager`** to load and display the `curse_dialogue` and any subsequent fainting dialogue from `intro.json`.
    -   After the dialogue finishes, the screen fades to black, and the game transitions to the `WorldScene`.

## Expected Outcome

-   The game starts and uses the `DialogueManager` to display the opening narrative from `intro.json`.
-   The quiz minigame begins, following the 4-phase structure.
-   The quiz ends by using the `DialogueManager` to display the final curse and fainting dialogue from `intro.json`.
-   The game correctly transitions to the `WorldScene`.
