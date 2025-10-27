<script lang="ts">
  import { gameTime } from '../stores';
  import type { GameTime } from '../stores';

  /**
   * Format time in HH:MM:SS format
   */
  function formatTime(time: GameTime): string {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}:${time.second.toString().padStart(2, '0')}`;
  }

  /**
   * Check if time is close to midnight (warning at 23:50+)
   */
  function isWarning(time: GameTime): boolean {
    return time.hour === 23 && time.minute >= 50;
  }

  /**
   * Check if time is very close to midnight (danger at 23:58+)
   */
  function isDanger(time: GameTime): boolean {
    return time.hour === 23 && time.minute >= 58;
  }
</script>

<div class="clock">
  <div class="clock-icon">🕐</div>
  <div class="clock-time" class:warning={isWarning($gameTime)} class:danger={isDanger($gameTime)}>
    {formatTime($gameTime)}
  </div>
</div>

<style>
  .clock {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 28px;
    font-weight: bold;
    color: #ff6b35;
  }

  .clock-icon {
    font-size: 32px;
  }

  .clock-time {
    font-family: 'Courier New', monospace;
    transition: color 0.3s;
  }

  .clock-time.warning {
    color: #ffaa00;
  }

  .clock-time.danger {
    color: #ff0000;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
