<script lang="ts">
  import { dialogue } from '../stores';
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';
  import { DialogueManager } from '../../game/services/DialogueManager';

  let displayedText = $state('');
  let fullText = $state('');
  let isTyping = $state(false);
  let typewriterInterval: number | null = null;
  let currentCharIndex = $state(0);

  // Placeholder sound effect (will be replaced with actual audio)
  const playBlipSound = () => {
    // TODO: Play actual sound effect
    // For now, just a placeholder
  };

  /**
   * Start typewriter effect for current dialogue
   */
  function startTypewriter(text: string) {
    fullText = text;
    displayedText = '';
    currentCharIndex = 0;
    isTyping = true;

    // Clear any existing interval
    if (typewriterInterval !== null) {
      clearInterval(typewriterInterval);
    }

    // Type one character every 30ms
    typewriterInterval = setInterval(() => {
      if (currentCharIndex < fullText.length) {
        displayedText += fullText[currentCharIndex];
        currentCharIndex++;
        playBlipSound();
      } else {
        // Finished typing
        isTyping = false;
        if (typewriterInterval !== null) {
          clearInterval(typewriterInterval);
          typewriterInterval = null;
        }
      }
    }, 30);
  }

  /**
   * Skip the typewriter effect and show full text
   */
  function skipTypewriter() {
    if (typewriterInterval !== null) {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
    }
    displayedText = fullText;
    isTyping = false;
  }

  /**
   * Handle click on dialogue box
   */
  function handleClick() {
    if (isTyping) {
      // Skip typewriter effect
      skipTypewriter();
    } else {
      // Advance to next line
      DialogueManager.advanceDialogue();
    }
  }

  /**
   * Handle show-dialogue event from EventBus (legacy support)
   */
  function handleShowDialogue(data: any) {
    dialogue.set(data);
    if (data && data.text) {
      startTypewriter(data.text);
    }
  }

  /**
   * Handle dialogue-line-start event from DialogueManager
   */
  function handleDialogueLineStart(line: any) {
    if (line && line.text) {
      startTypewriter(line.text);
    }
  }

  /**
   * Get portrait icon based on speaker
   */
  function getPortraitIcon(speaker: string): string {
    if (speaker.startsWith('jessica')) {
      return '👧';
    } else if (speaker === 'narrator') {
      return '';
    } else if (speaker === 'duolingo') {
      return '🦉';
    }
    return '❓';
  }

  /**
   * Get speaker display name
   */
  function getSpeakerName(speaker: string): string {
    if (speaker.startsWith('jessica')) {
      return 'Jessica';
    } else if (speaker === 'narrator') {
      return 'Narrator';
    } else if (speaker === 'duolingo') {
      return 'Duolingo';
    }
    return speaker;
  }

  /**
   * Get portrait color based on emotion
   */
  function getPortraitColor(speaker: string): string {
    if (speaker === 'jessica_neutral') return '#4a90e2';
    if (speaker === 'jessica_surprised') return '#f5a623';
    if (speaker === 'jessica_happy') return '#7ed321';
    if (speaker === 'jessica_sad') return '#8b7e8a';
    if (speaker === 'duolingo') return '#58cc02';
    return '#888';
  }

  // Watch for dialogue changes
  $effect(() => {
    if ($dialogue && $dialogue.text) {
      startTypewriter($dialogue.text);
    }
  });

  onMount(() => {
    EventBus.on('show-dialogue', handleShowDialogue);
    EventBus.on('dialogue-line-start', handleDialogueLineStart);
  });

  onDestroy(() => {
    EventBus.off('show-dialogue', handleShowDialogue);
    EventBus.off('dialogue-line-start', handleDialogueLineStart);

    // Clean up typewriter interval
    if (typewriterInterval !== null) {
      clearInterval(typewriterInterval);
    }
  });
</script>

{#if $dialogue}
  <div class="dialogue-box" onclick={handleClick}>
    <div class="dialogue-content">
      {#if $dialogue.character !== 'narrator'}
        <div class="character-portrait">
          <div
            class="portrait-placeholder"
            style="background-color: {getPortraitColor($dialogue.character)}"
          >
            {getPortraitIcon($dialogue.character)}
          </div>
          <div class="character-name">
            {getSpeakerName($dialogue.character)}
          </div>
        </div>
      {/if}

      <div class="dialogue-text" class:narrator={$dialogue.character === 'narrator'}>
        <p>{displayedText}{#if isTyping}<span class="cursor">▋</span>{/if}</p>
      </div>

      {#if !isTyping && !DialogueManager.isActive()}
        <div class="advance-indicator">▼</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .dialogue-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 16px 24px;
    cursor: pointer;
  }

  .dialogue-content {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    background-color: #3d3d3d;
    border: 2px solid #ff6b35;
    border-radius: 12px;
    padding: 16px;
    position: relative;
    transition: background-color 0.2s;
  }

  .dialogue-content:hover {
    background-color: #454545;
  }

  .character-portrait {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 80px;
  }

  .portrait-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 3px solid #ff6b35;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .character-name {
    font-size: 12px;
    font-weight: bold;
    color: #ff6b35;
    text-transform: uppercase;
  }

  .dialogue-text {
    flex: 1;
    color: #ffffff;
    font-size: 18px;
    line-height: 1.6;
    min-height: 60px;
    display: flex;
    align-items: center;
  }

  .dialogue-text.narrator {
    text-align: center;
    font-style: italic;
    color: #cccccc;
  }

  .dialogue-text p {
    margin: 0;
  }

  .cursor {
    display: inline-block;
    animation: blink 0.7s infinite;
    margin-left: 2px;
  }

  @keyframes blink {
    0%, 50% {
      opacity: 1;
    }
    51%, 100% {
      opacity: 0;
    }
  }

  .advance-indicator {
    position: absolute;
    bottom: 8px;
    right: 16px;
    color: #ff6b35;
    font-size: 20px;
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
</style>
