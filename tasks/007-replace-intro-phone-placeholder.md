# Task 007: Replace Intro Scene Phone Placeholder

## Objective

To replace the simple geometric placeholder for the cell phone in the `IntroScene` with a high-quality sprite and add a subtle animation to its notification icon, making the opening scene more visually engaging.

## Requirements

1.  **Asset Location:** The new art asset will be located at `public/assets/images/ui/phone_intro.png`.

2.  **Replace Placeholder in `IntroScene.ts`:**
    *   Remove the code that draws the current geometric shape for the phone.
    *   Load and add the new `phone_intro.png` image as a Phaser sprite in the center of the scene.

3.  **Implement Notification Animation:**
    *   The Duolingo notification icon on the phone sprite needs a continuous "pulsing" animation to draw the player's eye.
    *   This can be achieved using a Phaser Tween. Create a tween that gently scales the notification icon up and down in a loop (e.g., from 1.0x to 1.1x scale and back).
    *   **Note:** Depending on the final asset, it might be necessary to load the notification icon as a separate sprite layered on top of the main phone image to animate it independently. The implementation should be flexible enough to accommodate this.

## Expected Outcome

-   The `IntroScene` no longer displays a basic geometric shape for the phone.
-   The new, detailed smartphone sprite from `public/assets/images/ui/phone_intro.png` is displayed in the center of the scene.
-   The Duolingo notification on the phone has a continuous, subtle pulsing or blinking animation.
