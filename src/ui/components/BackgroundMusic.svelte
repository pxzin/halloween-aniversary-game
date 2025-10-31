<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';

  let audioElement: HTMLAudioElement | null = null;
  let isPlaying = $state(false);
  let volume = $state(0.3); // Default volume at 30%

  function startMusic() {
    if (audioElement && !isPlaying) {
      console.log('[BackgroundMusic] Starting background music');
      audioElement.volume = volume;
      audioElement.play().catch(err => {
        console.error('[BackgroundMusic] Error playing music:', err);
      });
      isPlaying = true;
    }
  }

  function stopMusic() {
    if (audioElement && isPlaying) {
      console.log('[BackgroundMusic] Stopping background music');
      audioElement.pause();
      audioElement.currentTime = 0;
      isPlaying = false;
    }
  }

  function setVolume(newVolume: number) {
    volume = Math.max(0, Math.min(1, newVolume)); // Clamp between 0 and 1
    if (audioElement) {
      audioElement.volume = volume;
    }
  }

  onMount(() => {
    // Listen for music control events
    EventBus.on('start-background-music', startMusic);
    EventBus.on('stop-background-music', stopMusic);
    EventBus.on('set-music-volume', setVolume);

    // Auto-start music when component mounts (game starts)
    setTimeout(() => {
      startMusic();
    }, 500);
  });

  onDestroy(() => {
    EventBus.off('start-background-music', startMusic);
    EventBus.off('stop-background-music', stopMusic);
    EventBus.off('set-music-volume', setVolume);

    // Clean up audio
    stopMusic();
  });
</script>

<!-- Hidden audio element -->
<audio
  bind:this={audioElement}
  src="/assets/audio/music/background_theme.mp3"
  loop
  preload="auto"
>
  <track kind="captions" />
</audio>

<style>
  /* No styles needed - audio is invisible */
</style>
