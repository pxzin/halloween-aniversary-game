# Task 013: Implement Hallway Scene and Objective Reveal

## Objective

To implement the `HallwayScene`, which serves as a central hub. This task includes creating the interactive elements for the Owl's note, which reveals the main game objective, and for collecting the `broom` item.

## Requirements

### 1. Create `HallwayScene.ts`

-   Create a new Phaser scene file at `src/game/scenes/HallwayScene.ts`.
-   **Background:** Load and display `public/assets/images/backgrounds/hallway.png`.
-   **Navigation:**
    *   The scene should be accessible from the `StairsScene`.
    *   Create interactive zones for navigating to other areas (Backyard, Living Room, Kitchen), although the transitions themselves will be implemented in later tasks.

### 2. Implement Owl's Note Interaction

-   Create an interactive zone over the note tacked to the wall.
-   When clicked, it should trigger the `note_pickup` and then the `note_reading` dialogues from `src/game/data/dialogues/hallway.json`.
-   **Objective Reveal:** After the `note_reading` dialogue concludes, an event should be dispatched via the `EventBus` (e.g., `reveal_objectives`).
-   A new UI component, `Objectives.svelte`, should listen for this event and become visible. This component will display five empty slots or icons representing the five gifts to be collected.

### 3. Create `Objectives.svelte` Component

-   Create a new Svelte component at `src/ui/components/Objectives.svelte`.
-   Initially, this component is hidden.
-   When it receives the `reveal_objectives` event, it becomes visible (e.g., positioned on the left side of the screen).
-   It should display 5 placeholder slots for the gifts. As gifts are collected, these slots will be filled.

### 4. Implement Broom Item

-   Create an interactive zone over the broom leaning against the wall.
-   When clicked, it should:
    *   Add the `broom` item to the player's inventory.
    *   Trigger the `found_broom` dialogue from `src/game/data/dialogues/hallway.json`.
    *   Make the broom visually disappear from the scene.

### 5. Dialogue Integration

-   Ensure all specified dialogues from `src/game/data/dialogues/hallway.json` are correctly triggered and displayed using the `DialogueManager`.

## Expected Outcome

-   The player can enter the `HallwayScene` from the `StairsScene`.
-   Clicking the note on the wall displays the correct dialogue and reveals the main objectives UI.
-   The `broom` can be collected and added to the inventory.
-   All associated dialogues are displayed correctly.
