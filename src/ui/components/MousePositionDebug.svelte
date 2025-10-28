<script lang="ts">
  import { onMount } from 'svelte';
  import { DEV_MODE } from '../../config/devMode';

  // Only show in dev mode (controlled by VITE_DEV_MODE in .env)
  const isDev = DEV_MODE;

  let mouseX = $state(0);
  let mouseY = $state(0);
  let isVisible = $state(false);

  onMount(() => {
    if (!isDev) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isVisible = true;
    };

    const handleMouseLeave = () => {
      isVisible = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  });
</script>

{#if isDev && isVisible}
  <div
    class="mouse-position"
    style="left: {mouseX + 15}px; top: {mouseY + 15}px"
  >
    <div class="coords">
      <span class="label">X:</span>
      <span class="value">{mouseX}</span>
      <span class="separator">|</span>
      <span class="label">Y:</span>
      <span class="value">{mouseY}</span>
    </div>
  </div>
{/if}

<style>
  .mouse-position {
    position: fixed;
    pointer-events: none;
    z-index: 99999;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    user-select: none;
  }

  .coords {
    background: rgba(0, 0, 0, 0.85);
    color: #00ff00;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #00ff00;
    box-shadow:
      0 0 10px rgba(0, 255, 0, 0.5),
      0 0 20px rgba(0, 255, 0, 0.3);
    display: flex;
    gap: 6px;
    align-items: center;
    white-space: nowrap;
  }

  .label {
    color: #00ff00;
    font-weight: bold;
  }

  .value {
    color: #00ffff;
    font-weight: normal;
    min-width: 35px;
    text-align: right;
  }

  .separator {
    color: #666;
  }
</style>
