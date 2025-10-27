# Task: UI Adjustment for Character Portraits

**Note:** This is an unnumbered, high-priority task to be addressed as soon as possible.

## Objective

Adjust the `DialogueBox.svelte` component and its associated CSS to properly accommodate the character portrait assets, ensuring they are displayed at the correct aspect ratio.

## Requirements

1.  **Reference Dimensions:** The source portrait images (e.g., `jessica_neutral.png`) have dimensions of **1024x1536 pixels**.

2.  **CSS Modifications:**
    *   Target the CSS for the portrait container within the `DialogueBox.svelte` component.
    *   The portrait should be displayed at a fixed height, for example, `300px`.
    *   The width should be set to `auto` to maintain the native aspect ratio of the image.
    *   Ensure the placeholder element (e.g., the colored square) also respects these new dimensions to prevent layout shifts.

3.  **Update Image Path:**
    *   In the `DialogueBox.svelte` component, when loading a portrait, the image `src` path should be constructed correctly. Since the assets are in the `public` directory, the path will be relative to the root (e.g., `/assets/images/portraits/jessica_neutral.png`).

## Expected Outcome

-   The dialogue box UI is adjusted.
-   The placeholder for the character portrait has the same aspect ratio as the real image (approx. 1:1.5).
-   When a dialogue line with a speaker is active, the corresponding portrait image is displayed at a height of `300px` (or another suitable size) without being stretched or distorted.
