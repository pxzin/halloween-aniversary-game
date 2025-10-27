# Task 005: Enhance Dialogue System UI and Scripting

## Objective

To evolve the basic dialogue box into a feature-rich system, incorporating external script files, character portraits, and a classic JRPG-style "typewriter" text effect.

## Requirements

### 1. External Dialogue Scripting

-   **Create Directory:** Establish a new directory at `src/game/data/dialogues/`.
-   **Define Format:** Dialogue scripts will be stored as JSON files. Each file will represent a specific conversation.
-   **Create Sample Script:** Create a placeholder script at `src/game/data/dialogues/sample.json`. The structure should be as follows:

    ```json
    {
      "id": "sample_dialogue",
      "lines": [
        { "speaker": "jessica_neutral", "text": "This is the first line of dialogue." },
        { "speaker": "narrator", "text": "This is a narration line, without a portrait." },
        { "speaker": "jessica_surprised", "text": "And this is a second line, with a different emotion!" }
      ]
    }
    ```

### 2. Dialogue Manager Service

-   **Create `DialogueManager.ts`:** This service will handle the logic for conversations.
-   **Methods:**
    -   `loadScript(scriptId: string)`: Fetches the corresponding JSON file from the `dialogues` directory.
    -   `startDialogue()`: Initializes the conversation, setting the current line to the first one.
    -   `advanceDialogue()`: Moves to the next line in the script. If it's the last line, it should trigger an event to close the dialogue box.
-   The manager should update the `dialogue` Svelte store (from `stores.ts`) with the current line's data (speaker and text).

### 3. Enhance `DialogueBox.svelte`

-   **Refactor:** The component should now be driven by the `DialogueManager`.
-   **Portrait Area:** Implement a designated area (e.g., to the left of the text box) where the speaker's portrait will appear. For now, use simple colored squares or text labels as placeholders based on the `speaker` ID (e.g., `jessica_neutral`).
-   **Typewriter Effect:**
    -   When a new line of dialogue begins, the text should appear one character at a time.
    -   Implement this using a Svelte `onMount` or a reactive statement that triggers a `setInterval`.
    -   For each character that appears, play a subtle, repeating "blip" or "tick" sound effect. A placeholder sound file should be referenced.
-   **Click to Advance/Skip:**
    -   If the player clicks while the text is still typing, the effect should skip, and the full line of text should appear instantly.
    -   If the player clicks when the text is already fully displayed, it should trigger `DialogueManager.advanceDialogue()` to move to the next line.

## Expected Outcome

-   A `DialogueManager` can load and parse conversation scripts from JSON files.
-   The `DialogueBox.svelte` component displays a placeholder portrait and text according to the loaded script.
-   Text appears with a letter-by-letter typewriter effect, accompanied by a placeholder sound.
-   The player can click to skip the typing effect or advance to the next line of dialogue.
-   The dialogue box correctly closes after the last line.
