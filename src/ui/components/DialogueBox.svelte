<script lang="ts">
  import { dialogue } from '../stores';
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';
  import { DialogueManager } from '../../game/services/DialogueManager';

  // Speaker can be either a string (legacy) or an object (new format)
  type SpeakerData = string | { character: string; emotion: string };

  let displayedText = $state('');
  let fullText = $state('');
  let isTyping = $state(false);
  let typewriterInterval: number | null = null;
  let currentCharIndex = $state(0);
  let portraitError = $state(false);
  let missingEmotion = $state('');

  /**
   * Parse speaker data - supports both legacy string format and new object format
   */
  function parseSpeaker(speaker: SpeakerData): { character: string; emotion: string } {
    if (typeof speaker === 'string') {
      // Legacy format: "jessica_neutral" or "narrator"
      const parts = speaker.split('_');
      if (parts.length === 1) {
        return { character: parts[0], emotion: 'neutral' };
      }
      return { character: parts[0], emotion: parts[1] };
    } else {
      // New format: { character: "jessica", emotion: "neutral" }
      return speaker;
    }
  }

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
   * Get portrait image path based on speaker
   */
  function getPortraitPath(speaker: SpeakerData, useFallback: boolean = false): string {
    const { character, emotion } = parseSpeaker(speaker);

    if (character === 'narrator') {
      return '';
    }

    // If fallback needed, use neutral emotion
    if (useFallback) {
      return `/assets/images/portraits/${character}_neutral.png`;
    }

    // Path to portrait images in public folder
    return `/assets/images/portraits/${character}_${emotion}.png`;
  }

  /**
   * Handle portrait image load error - fallback to neutral emotion
   */
  function handlePortraitError(event: Event) {
    const speaker = $dialogue?.character || '';
    const { character, emotion } = parseSpeaker(speaker);

    portraitError = true;
    missingEmotion = emotion;

    const missingPath = `/assets/images/portraits/${character}_${emotion}.png`;
    console.warn(`Portrait not found, falling back to neutral. Missing: ${missingPath}`);

    // Set image src to fallback
    const img = event.target as HTMLImageElement;
    img.src = getPortraitPath(speaker, true);
  }

  /**
   * Reset portrait error state when dialogue changes
   */
  function resetPortraitState() {
    portraitError = false;
    missingEmotion = '';
  }

  /**
   * Get speaker display name
   */
  function getSpeakerName(speaker: SpeakerData): string {
    const { character } = parseSpeaker(speaker);

    if (character === 'jessica') {
      return 'Jessica';
    } else if (character === 'narrator') {
      return 'Narrator';
    } else if (character === 'owl') {
      return 'Duo';
    } else if (character === 'duolingo') {
      return 'Duolingo';
    }
    return character;
  }

  /**
   * Check if speaker is narrator (no portrait needed)
   */
  function isNarrator(speaker: SpeakerData): boolean {
    const { character } = parseSpeaker(speaker);
    return character === 'narrator';
  }


  // Watch for dialogue changes
  $effect(() => {
    if ($dialogue && $dialogue.text) {
      resetPortraitState();
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
      {#if !isNarrator($dialogue.character)}
        <div class="character-portrait">
          <div class="portrait-container">
            <img
              src={getPortraitPath($dialogue.character)}
              alt={getSpeakerName($dialogue.character)}
              class="portrait-image"
              onerror={handlePortraitError}
            />
            {#if portraitError}
              <div class="missing-emotion-label">
                Missing: {missingEmotion}
              </div>
            {/if}
          </div>
          <div class="character-name">
            {getSpeakerName($dialogue.character)}
          </div>
        </div>
      {/if}

      <div class="dialogue-text" class:narrator={isNarrator($dialogue.character)}>
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
    padding: 12px 16px;
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
    padding: 12px;
    position: relative;
    transition: background-color 0.2s;
  }

  @media (max-width: 1200px) {
    .dialogue-content {
      gap: 12px;
      padding: 10px;
    }
  }

  @media (max-width: 900px) {
    .dialogue-box {
      padding: 8px 12px;
    }

    .dialogue-content {
      gap: 10px;
      padding: 8px;
    }
  }

  .dialogue-content:hover {
    background-color: #454545;
  }

  .character-portrait {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .portrait-container {
    position: relative;
  }

  .portrait-image {
    height: min(300px, 35vh);
    width: auto;
    max-width: 200px;
    border-radius: 8px;
    border: 3px solid #ff6b35;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    object-fit: contain;
  }

  @media (max-width: 1200px) {
    .portrait-image {
      height: min(250px, 30vh);
      max-width: 170px;
    }
  }

  @media (max-width: 900px) {
    .portrait-image {
      height: min(200px, 25vh);
      max-width: 140px;
      border: 2px solid #ff6b35;
    }
  }

  @media (max-width: 600px) {
    .portrait-image {
      height: min(150px, 20vh);
      max-width: 100px;
    }
  }

  .missing-emotion-label {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 107, 53, 0.9);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    pointer-events: none;
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

  @media (max-width: 1200px) {
    .dialogue-text {
      font-size: 16px;
      min-height: 50px;
    }
  }

  @media (max-width: 900px) {
    .dialogue-text {
      font-size: 15px;
      min-height: 45px;
    }
  }

  @media (max-width: 600px) {
    .dialogue-text {
      font-size: 14px;
      min-height: 40px;
    }
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
