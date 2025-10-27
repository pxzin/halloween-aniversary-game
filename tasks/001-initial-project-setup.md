# Task 001: Initial Project Setup

## Objective

Initialize the project structure using Vite, and install the core dependencies: Phaser, Svelte, and UnoCSS. This task will establish the foundational boilerplate for the game.

## Requirements

1.  **Initialize Project:** Use `pnpm` to initialize a new project.

2.  **Install Dependencies:** Install the following packages using `pnpm`:
    *   **Production Dependencies:**
        *   `phaser`
    *   **Development Dependencies:**
        *   `vite`
        *   `typescript`
        *   `svelte`
        *   `@sveltejs/vite-plugin-svelte`
        *   `unocss`

3.  **Create `index.html`:**
    *   Create a root `index.html` file.
    *   It should include a `<div id="app"></div>` for the Svelte UI and a `<div id="game-container"></div>` for the Phaser canvas.
    *   Link to the main entry point script: `<script type="module" src="/src/main.ts"></script>`.

4.  **Configure TypeScript:**
    *   Create a `tsconfig.json` file.
    *   Configure it for a modern web project using Vite, including settings for Svelte.

5.  **Configure Vite:**
    *   Create a `vite.config.ts` file.
    *   Import and configure the Svelte and UnoCSS plugins.

6.  **Create Initial Source Files:**
    *   Create the main entry point at `src/main.ts`.
    *   This file should import the UnoCSS entry file and initialize a new Svelte component to mount on the `#app` div.
    *   Create a placeholder Svelte component at `src/ui/App.svelte`.
    *   Create a placeholder Phaser game instance at `src/game/Game.ts`.

## Expected Outcome

*   A new project is created and all specified dependencies are installed.
*   A `vite.config.ts` and `tsconfig.json` are present and correctly configured.
*   The `src` directory contains the initial file structure (`main.ts`, `ui/App.svelte`, `game/Game.ts`).
*   Running `pnpm dev` should start the Vite development server without errors, displaying the content from `App.svelte`.
