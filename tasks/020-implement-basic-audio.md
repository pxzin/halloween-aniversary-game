# Task 020: Implement Basic Audio

## Objective

To add basic audio to the game, including a looping background music track and a sound effect for the dialogue text typing, to enhance the atmosphere and player feedback.

## Requirements

### 1. Implement Background Music

-   **Asset Location:** A looping, Halloween-themed MIDI or MP3 file will be located at `public/assets/audio/music/background_theme.mp3`.
-   **Implementation:**
    *   In the `BootScene.ts` or a dedicated `AudioManager` service, load the background music.
    *   The music should start playing automatically (and softly) when the `MainMenuScene` begins.
    *   It must loop continuously throughout the entire game.

### 2. Implement Dialogue Text Sound

-   **Asset Location:** A short, typewriter-like or blip sound effect will be located at `public/assets/audio/sfx/text_blip.wav`.
-   **Implementation:**
    *   In the `DialogueBox.svelte` component, where the typewriter effect for the text is handled, trigger the `text_blip.wav` sound to play for each character that appears on screen.
    *   Ensure the sound is short and not overly intrusive.

## Expected Outcome

-   A Halloween-themed background music track plays continuously and loops from the main menu onwards.
-   A sound effect plays for each character that is typed out in the dialogue boxes.
