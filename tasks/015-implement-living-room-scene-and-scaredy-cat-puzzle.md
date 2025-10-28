# Task 015: Implement Living Room Scene and Scaredy Cat Puzzle

## Objective

To implement the `LivingRoomScene` (`Cenário 6`), including its background, interactive elements, and the `Scaredy Cat` puzzle (`Puzzle 05`) to obtain the `Cell Phone`.

## Requirements

### 1. Create `LivingRoomScene.ts`

-   Create a new Phaser scene file at `src/game/scenes/LivingRoomScene.ts`.
-   **Background:** Load and display `public/assets/images/backgrounds/living_room.png`.
-   **Navigation:**
    *   The scene should be accessible from the `HallwayScene`.
    *   Create interactive zones to return to the `HallwayScene`.
    *   Create an interactive zone to navigate to the `OfficeScene` (to be implemented later).

### 2. Implement Scaredy Cat Puzzle (`Puzzle 05`)

-   **Initial State:** The scene starts with chairs blocking access to the cabinet and the office door.
-   **Interactive Elements:**
    *   **Chairs:** Create an interactive zone over the scattered chairs. Clicking it should:
        *   Trigger the `room_tidy_up` dialogue.
        *   Apply a **5-minute time penalty** (update the `gameTime` store).
        *   Visually clear the chairs, unblocking access to the cabinet and office door.
    *   **Cabinet:** Create an interactive zone over the cabinet.
        *   If the chairs are blocking, clicking it should trigger a dialogue indicating it's blocked.
        *   If unblocked, clicking it should open the cabinet, revealing Sombra sleeping on the cell phone.
    *   **Sombra (The Cat):** Create an interactive zone over Sombra inside the cabinet.
        *   Clicking Sombra should trigger the `sombra_choices` dialogue and present the player with three options:
            1.  "Gritar com a gata"
            2.  "Fazer pspspsps"
            3.  "Bater palmas"
        *   **Failure Cases (Yell/Pspsps):** Choosing the first two options should trigger their respective dialogues (`sombra_yell`, `sombra_pspsps`) and Sombra remains.
        *   **Success Case (Clap Hands):** Choosing "Bater palmas" should:
            *   Trigger the `sombra_clap` dialogue.
            *   Make Sombra visually disappear from the cabinet.
            *   Reveal the `Cell Phone`.
    *   **Cell Phone:** Once revealed, clicking the `Cell Phone` should:
        *   Add `cell_phone` to the player's inventory.
        *   Trigger the `found_cellphone` dialogue.
        *   Make the `Cell Phone` visually disappear from the scene.

### 3. Dialogue Integration

-   Ensure all specified dialogues from `src/game/data/dialogues/living_room.json` are correctly triggered and displayed using the `DialogueManager`.

## Expected Outcome

-   The player can navigate to and from the `LivingRoomScene`.
-   The `Scaredy Cat` puzzle can be fully completed, leading to the acquisition of the `Cell Phone`.
-   All associated dialogues are displayed correctly.
-   The time penalty for tidying the room is applied.
