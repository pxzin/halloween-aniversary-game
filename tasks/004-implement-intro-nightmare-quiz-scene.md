# Task 004: Implement Intro Nightmare Quiz Scene

## Objective

To develop the game's opening sequence as described in the GDD. This includes the initial narrative cutscene and the interactive "Nightmare Quiz" minigame, which sets up the story.

## Requirements

### 1. Intro Cutscene Scene

-   **Create `IntroScene.ts`:** This new Phaser scene will manage the opening sequence. It should be the first scene the game loads after the `BootScene`.
-   **Narrative Display:** Use the Svelte `DialogueBox` component (created in Task 003) to display the opening narrative text block by block.
    -   *Narrative:* Jessica is at home, receives angry messages from the Duolingo Owl, and opens the app.
-   **Background:** The background for this scene should be a simple, dark, dream-like texture. The main focus is a large image of a smartphone in the center of the screen.

### 2. Quiz Minigame

-   **Create `Quiz.svelte` component:** This Svelte component will be rendered on top of the `IntroScene`.
-   **Quiz Data:** Create a mock data file (`src/game/data/quizQuestions.ts`). This file should export different arrays of questions for each phase of the quiz (e.g., `phase1_ptbr`, `phase1_it`, `phase2_mixed`, `phase3_asian`, `phase4_bug`).

### 3. Quiz Progression and Climax

-   **Phase 1: The Normal Quiz (5-6 questions)**
    -   The quiz begins by randomly presenting questions from Portuguese, Italian, and English. The player must answer correctly.
    -   The timer should get progressively faster with each question.

-   **Phase 2: The Madness (2-3 questions)**
    -   After 5-6 correct answers, the quiz enters a "madness" phase.
    -   Questions should now mix the three languages (e.g., "Qual é the capital della Francia?").
    -   From this point forward, **any answer is considered correct**.

-   **Phase 3: The Chaos (2 questions)**
    -   The quiz should now pull from a new pool of questions that also includes Chinese, Japanese, and Korean characters/words mixed in.

-   **Phase 4: The Matrix Bug (1 question)**
    -   The final question should be a jumble of all languages plus random special characters (e.g., `*&^%$#@`).

-   **Climax and Transition:**
    -   After the final "bugged" question is answered, the quiz UI disappears.
    -   The `DialogueBox` should show the final sequence: the Owl's curse, Jessica's dialogue about feeling faint, and then the screen fading to black.
    -   After the fade to black, the game must transition to the main gameplay scene (`WorldScene`).

## Expected Outcome

-   The game starts with the `IntroScene` and narrative.
-   The quiz minigame begins and follows the four distinct phases of progression.
-   The timer speeds up during Phase 1.
-   The game correctly accepts any answer from Phase 2 onwards.
-   The quiz ends with the specified dialogue sequence and a fade to black.
-   After the intro, the game successfully transitions to the `WorldScene`.
