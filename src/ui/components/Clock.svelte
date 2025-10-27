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

<div class="timer-container">
  <div class="timer" class:warning={isWarning($gameTime)} class:danger={isDanger($gameTime)}>
    🎃 {formatTime($gameTime)} 🎃
  </div>
</div>

<style>
  .timer-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .timer {
    color: #ff5e00;
    font-size: 42px;
    font-weight: 900;
    font-family: 'Arial Black', 'Arial Bold', 'Gadget', sans-serif;
    text-shadow:
      0 0 20px rgba(255, 94, 0, 0.8),
      0 0 40px rgba(255, 94, 0, 0.5),
      0 0 60px rgba(138, 43, 226, 0.3);
    letter-spacing: 4px;
    animation: pulse 2s infinite ease-in-out;
    transition: color 0.3s, text-shadow 0.3s;
  }

  /* Warning state - yellow glow */
  .timer.warning {
    color: #ffaa00;
    text-shadow:
      0 0 20px rgba(255, 170, 0, 0.9),
      0 0 40px rgba(255, 170, 0, 0.6),
      0 0 60px rgba(255, 94, 0, 0.4);
  }

  /* Danger state - red glow with faster pulse */
  .timer.danger {
    color: #ff0000;
    text-shadow:
      0 0 20px rgba(255, 0, 0, 1),
      0 0 40px rgba(255, 0, 0, 0.7),
      0 0 60px rgba(255, 94, 0, 0.5);
    animation: pulseDanger 0.8s infinite ease-in-out;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }

  @keyframes pulseDanger {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.08);
      opacity: 0.85;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    .timer {
      font-size: 36px;
      letter-spacing: 3px;
    }
  }

  @media (max-width: 900px) {
    .timer {
      font-size: 32px;
      letter-spacing: 2px;
    }
  }

  @media (max-width: 600px) {
    .timer {
      font-size: 28px;
      letter-spacing: 1px;
    }
  }
</style>
