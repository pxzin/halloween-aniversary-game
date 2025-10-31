<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  let isVisible = $state(false);
  let videoElement: HTMLVideoElement | null = null;

  function show() {
    console.log('[EndingVideo] Showing ending video');
    isVisible = true;

    // Wait for DOM to update, then play video
    setTimeout(() => {
      if (videoElement) {
        videoElement.play().catch(err => {
          console.error('[EndingVideo] Error playing video:', err);
        });
      }
    }, 100);
  }

  function onVideoEnded() {
    console.log('[EndingVideo] Video ended, showing happy birthday screen');
    isVisible = false;

    // Emit event to show happy birthday screen
    EventBus.emit('show-happy-birthday');
  }

  function skipVideo() {
    console.log('[EndingVideo] Skipping video');
    if (videoElement) {
      videoElement.pause();
    }
    isVisible = false;
    EventBus.emit('show-happy-birthday');
  }

  onMount(() => {
    EventBus.on('show-ending-video', show);
  });

  onDestroy(() => {
    EventBus.off('show-ending-video', show);
  });
</script>

{#if isVisible}
  <div class="video-overlay">
    <div class="video-container">
      <!-- Video element -->
      <video
        bind:this={videoElement}
        src="/assets/video/ending.mp4"
        class="ending-video"
        onended={onVideoEnded}
        autoplay
        muted={false}
      >
        <track kind="captions" />
      </video>

      <!-- Skip button -->
      <button class="skip-button" onclick={skipVideo}>
        Pular ▶
      </button>
    </div>
  </div>
{/if}

<style>
  .video-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 15000;
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .video-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ending-video {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  .skip-button {
    position: absolute;
    bottom: 40px;
    right: 40px;
    padding: 12px 24px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #ff5e00;
    border-radius: 8px;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
  }

  .skip-button:hover {
    background: rgba(255, 94, 0, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 94, 0, 0.5);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .skip-button {
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      font-size: 14px;
    }
  }
</style>
