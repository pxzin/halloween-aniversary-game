# Task 002: Scene Management and UI Integration

## Objective

With the project dependencies installed, the next step is to create the core architectural scaffolding. This involves setting up a scene manager in Phaser to handle transitions between different game locations and establishing a communication bridge between the Phaser canvas (the game world) and the Svelte UI (dialogue boxes, inventory, etc.).

## Requirements

1.  **Event Bus:**
    *   Create a simple event emitter singleton at `src/game/EventBus.ts`.
    *   This will be used for communication between different parts of the application (Phaser -> Svelte, Svelte -> Phaser, Scene -> Scene).

2.  **Phaser Scene Setup:**
    *   Modify the main Phaser game configuration in `src/game/Game.ts`.
    *   Create and register three initial scenes:
        *   `BootScene.ts`: Responsible for loading essential assets.
        *   `MainMenuScene.ts`: A placeholder scene for the main menu.
        *   `WorldScene.ts`: The main scene where the point-and-click gameplay will occur.

3.  **Scene Implementation (Placeholders):**
    *   **`src/game/scenes/BootScene.ts`**: Create this scene. For now, it can just transition directly to the `MainMenuScene` on its `create()` method.
    *   **`src/game/scenes/MainMenuScene.ts`**: Create this scene. It should emit an event via the Event Bus to the Svelte UI, for instance `EventBus.emit('show-main-menu')`.
    *   **`src/game/scenes/WorldScene.ts`**: Create this scene. It will be the main gameplay area. For now, it can be empty.

4.  **Svelte UI Component:**
    *   Update the main Svelte component at `src/ui/App.svelte`.
    *   It should listen for events from the Event Bus.
    *   When it receives the `show-main-menu` event, it should display a simple button with the text "Start Game".
    *   When the "Start Game" button is clicked, the Svelte component should call a method on the `MainMenuScene` (or emit an event via the Event Bus, e.g., `EventBus.emit('start-game')`) to trigger the transition to the `WorldScene`.

5.  **Scene Transition:**
    *   The `MainMenuScene` should listen for the `start-game` event from the Event Bus.
    *   Upon receiving this event, it should use `this.scene.start('WorldScene')` to transition to the main gameplay scene.

## Expected Outcome

*   The application starts, and Phaser initializes.
*   The `BootScene` loads and immediately transitions to the `MainMenuScene`.
*   The `MainMenuScene` starts, and the Svelte UI displays a "Start Game" button.
*   Clicking the "Start Game" button in the UI makes Phaser transition from `MainMenuScene` to `WorldScene`.
*   The Svelte UI hides the "Start Game" button after the transition.
*   A clear communication channel (EventBus) exists between the game engine and the UI layer.
