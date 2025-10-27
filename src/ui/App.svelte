<script lang="ts">
  import Router from 'svelte-spa-router';
  import Home from '../routes/Home.svelte';
  import Game from '../routes/Game.svelte';

  // Define routes
  const routes = {
    '/': Home,
    '/game': Game,
  };
</script>

<!-- Router Component -->
<Router {routes} />

<style>
  /* Global body background - Halloween theme */
  :global(body) {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #1a0a2e 0%, #0f051d 100%);
    overflow: hidden;
    font-family: 'Arial Black', 'Arial Bold', Gadget, sans-serif;
  }

  /* Halloween background decorations */
  :global(body::before) {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(2px 2px at 60% 70%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(1px 1px at 80% 10%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(2px 2px at 90% 60%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(1px 1px at 33% 50%, rgba(255, 255, 255, 0.1), transparent),
      radial-gradient(2px 2px at 79% 53%, rgba(255, 255, 255, 0.1), transparent);
    background-size: 200% 200%;
    animation: sparkle 8s ease-in-out infinite;
    pointer-events: none;
    opacity: 0.5;
    z-index: 0;
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
</style>
