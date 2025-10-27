# Task 006: Implement Portrait Emotion System

## Objective

To enhance the dialogue system to support multiple emotional portraits for each character, with a robust fallback mechanism for missing assets.

## Requirements

### 1. Update Dialogue Script Format

The `speaker` field in the dialogue JSON files (e.g., `sample.json`) must be updated from a simple string to an object containing the character and their emotion.

-   **Old Format:** `"speaker": "jessica_neutral"`
-   **New Format:** `"speaker": { "character": "jessica", "emotion": "neutral" }`

This allows for more structured and extensible character data.

### 2. Establish Asset Naming Convention

All character portrait files must follow a strict naming convention:
`<characterName>_<emotion>.png`

-   **Examples:** `jessica_neutral.png`, `jessica_surprised.png`, `owl_furious.png`.

### 3. Update `DialogueBox.svelte` Logic

-   The component must be updated to handle the new speaker object format.
-   It should dynamically construct the path to the portrait image based on the data:
    `/assets/images/portraits/${character}_${emotion}.png`

### 4. Implement Fallback and Error Logging

This is the core requirement. The system must not break if an emotional portrait is missing.

-   **Fallback Mechanism:** Before rendering a portrait (e.g., `jessica_surprised.png`), the component must first check if that specific asset exists. A simple way to do this is to use the `onerror` attribute on the `<img>` tag.
-   **Fallback Path:** If the requested emotional portrait fails to load, the component must automatically attempt to load the character's default portrait as a fallback. The default is always the `_neutral` version (e.g., `jessica_neutral.png`).
-   **Error Logging:** When a fallback occurs, a descriptive warning must be logged to the browser's console. The message should clearly state which asset was not found.
    -   **Example Log:** `console.warn('Portrait not found, falling back to neutral. Missing: /assets/images/portraits/jessica_surprised.png')`

## Expected Outcome

-   The dialogue system can now correctly parse the new `speaker` object format.
-   The `DialogueBox` component dynamically loads portraits based on character and emotion (e.g., `jessica`, `surprised`).
-   If a specific emotional portrait is missing, the system gracefully falls back to the character's `_neutral.png` portrait without crashing.
-   A clear warning message is logged to the console whenever this fallback happens.
