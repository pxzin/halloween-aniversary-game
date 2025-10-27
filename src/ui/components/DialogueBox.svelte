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
   * Handle right-click on dialogue box to go back
   */
  function handleRightClick(event: MouseEvent) {
    // Prevent default context menu
    event.preventDefault();

    // Go back to previous dialogue
    DialogueManager.goBackDialogue();
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
      return 'Jéssica';
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
  <!-- Character portrait - positioned absolutely, overlaps dialogue box -->
  {#if !isNarrator($dialogue.character)}
    <div class="character-portrait">
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
      <div class="character-label">
        {getSpeakerName($dialogue.character)}
      </div>
    </div>
  {/if}

  <!-- Dialogue box -->
  <div class="dialogue-box" class:narrator-mode={isNarrator($dialogue.character)} onclick={handleClick} oncontextmenu={handleRightClick}>
    <div class="web-decoration"></div>
    <div class="accent-line"></div>

    {#if !isNarrator($dialogue.character)}
      <div class="character-name">
        {getSpeakerName($dialogue.character)}
      </div>
    {/if}

    <div class="dialogue-text" class:narrator={isNarrator($dialogue.character)}>
      <p>{displayedText}{#if isTyping}<span class="cursor">▋</span>{/if}</p>
    </div>

    {#if !isTyping}
      <div class="continue-indicator"></div>
    {/if}
  </div>
{/if}

<style>
  /* Character portrait - positioned absolutely, overlaps dialogue box */
  .character-portrait {
    position: absolute;
    bottom: 0;
    left: 30px;
    width: 280px;
    height: 420px;
    border: 5px solid #ff5e00;
    background: #000;
    overflow: hidden;
    box-shadow:
      0 0 30px rgba(255, 94, 0, 0.8),
      0 0 60px rgba(138, 43, 226, 0.6),
      inset 0 0 30px rgba(0, 0, 0, 0.7);
    z-index: 250;
    animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .character-portrait::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    background: linear-gradient(45deg, #ff5e00, #8a2be2, #ff5e00);
    background-size: 200% 200%;
    opacity: 0.6;
    filter: blur(15px);
    z-index: -1;
    animation: gradientShift 3s ease infinite;
  }

  .portrait-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(1.1) contrast(1.3) saturate(1.2);
  }

  .missing-emotion-label {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 94, 0, 0.95);
    color: white;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.6),
      0 0 15px rgba(255, 94, 0, 0.6);
    pointer-events: none;
    z-index: 10;
  }

  .character-label {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ff5e00 0%, #8a2be2 100%);
    color: #fff;
    font-size: 11px;
    font-weight: 900;
    padding: 4px 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 100%, 0 100%);
    box-shadow: 0 0 15px rgba(255, 94, 0, 0.8);
  }

  /* Dialogue box */
  .dialogue-box {
    position: absolute;
    bottom: 20px;
    left: 280px;
    right: 20px;
    height: 180px;
    background: linear-gradient(135deg, #0a0015 0%, #1a0a25 100%);
    border: 4px solid #ff5e00;
    border-radius: 4px;
    padding: 25px 30px;
    box-shadow:
      0 0 30px rgba(255, 94, 0, 0.6),
      0 0 60px rgba(138, 43, 226, 0.4),
      inset 0 0 20px rgba(255, 94, 0, 0.1);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 40px 100%);
    transform: skewX(-1deg);
    cursor: pointer;
    transition: all 0.3s;
    animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 260;
  }

  .dialogue-box.narrator-mode {
    left: 20px;
  }

  .dialogue-box::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    background: linear-gradient(45deg, #ff5e00, #8a2be2, #ff5e00, #8a2be2);
    background-size: 400% 400%;
    border-radius: 4px;
    opacity: 0.4;
    filter: blur(10px);
    z-index: -1;
    animation: gradientShift 3s ease infinite;
  }

  .dialogue-box:hover {
    box-shadow:
      0 0 40px rgba(255, 94, 0, 0.8),
      0 0 80px rgba(138, 43, 226, 0.6),
      inset 0 0 30px rgba(255, 94, 0, 0.15);
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%) skewX(-1deg);
      opacity: 0;
    }
    to {
      transform: translateX(0) skewX(-1deg);
      opacity: 1;
    }
  }

  /* Web decoration */
  .web-decoration {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 60px;
    height: 60px;
    opacity: 0.3;
    pointer-events: none;
  }

  .web-decoration::before {
    content: '🕸️';
    font-size: 50px;
    position: absolute;
    animation: webSway 3s ease-in-out infinite;
  }

  @keyframes webSway {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(5deg); }
  }

  /* Accent line */
  .accent-line {
    position: absolute;
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, #ff5e00 30%, #8a2be2 70%, transparent 100%);
    width: 100%;
    top: 10px;
    left: 0;
    opacity: 0.6;
    animation: lineShimmer 2s infinite;
  }

  @keyframes lineShimmer {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  /* Character name */
  .character-name {
    position: absolute;
    top: -35px;
    left: 0;
    background: linear-gradient(135deg, #ff5e00 0%, #8a2be2 100%);
    color: #ffffff;
    font-size: 20px;
    font-weight: 900;
    padding: 8px 25px 8px 15px;
    text-transform: uppercase;
    letter-spacing: 3px;
    clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 100%, 0 100%);
    text-shadow:
      2px 2px 4px rgba(0, 0, 0, 0.8),
      0 0 10px rgba(255, 94, 0, 0.8);
    box-shadow: 0 4px 15px rgba(255, 94, 0, 0.6);
  }

  /* Dialogue text */
  .dialogue-text {
    color: #ffffff;
    font-size: 22px;
    line-height: 1.7;
    font-weight: 600;
    transform: skewX(1deg);
    text-shadow:
      2px 2px 4px rgba(0, 0, 0, 0.8),
      0 0 10px rgba(138, 43, 226, 0.3);
    letter-spacing: 0.5px;
  }

  .dialogue-text.narrator {
    text-align: center;
    font-style: italic;
    color: #b388ff;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .dialogue-text p {
    margin: 0;
  }

  .cursor {
    display: inline-block;
    animation: blink 0.7s infinite;
    margin-left: 2px;
    color: #ff5e00;
    text-shadow:
      0 0 10px rgba(255, 94, 0, 0.8),
      0 0 20px rgba(255, 94, 0, 0.5);
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  /* Continue indicator - Enhanced */
  .continue-indicator {
    position: absolute;
    bottom: 20px;
    right: 25px;
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 18px solid #ff5e00;
    animation: bounceGlow 0.8s infinite ease-in-out, pulseBlink 1.6s infinite;
    filter: drop-shadow(0 0 12px rgba(255, 94, 0, 1));
    z-index: 10;
  }

  @keyframes bounceGlow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulseBlink {
    0%, 100% {
      opacity: 1;
      filter: drop-shadow(0 0 12px rgba(255, 94, 0, 1));
    }
    25% {
      opacity: 0.4;
      filter: drop-shadow(0 0 6px rgba(255, 94, 0, 0.6));
    }
    50% {
      opacity: 1;
      filter: drop-shadow(0 0 20px rgba(255, 94, 0, 1));
    }
    75% {
      opacity: 0.4;
      filter: drop-shadow(0 0 6px rgba(255, 94, 0, 0.6));
    }
  }

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    .character-portrait {
      width: 240px;
      height: 360px;
      left: 20px;
    }

    .dialogue-box {
      left: 240px;
      height: 160px;
      padding: 20px 25px;
    }

    .character-name {
      font-size: 18px;
      padding: 6px 20px 6px 12px;
    }

    .dialogue-text {
      font-size: 20px;
    }

    .continue-indicator {
      bottom: 18px;
      right: 20px;
      border-left: 13px solid transparent;
      border-right: 13px solid transparent;
      border-top: 16px solid #ff5e00;
    }
  }

  @media (max-width: 900px) {
    .character-portrait {
      width: 200px;
      height: 300px;
      left: 15px;
    }

    .dialogue-box {
      left: 195px;
      bottom: 15px;
      right: 15px;
      height: 140px;
      padding: 18px 20px;
    }

    .character-name {
      font-size: 16px;
      padding: 5px 18px 5px 10px;
      letter-spacing: 2px;
    }

    .dialogue-text {
      font-size: 18px;
    }

    .continue-indicator {
      bottom: 15px;
      right: 18px;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-top: 15px solid #ff5e00;
    }
  }

  @media (max-width: 600px) {
    .character-portrait {
      width: 160px;
      height: 240px;
      left: 10px;
      border: 3px solid #ff5e00;
    }

    .dialogue-box {
      left: 155px;
      bottom: 10px;
      right: 10px;
      height: 120px;
      padding: 15px;
      border: 3px solid #ff5e00;
    }

    .character-name {
      font-size: 14px;
      padding: 4px 15px 4px 8px;
      letter-spacing: 1px;
    }

    .dialogue-text {
      font-size: 16px;
    }

    .character-label {
      font-size: 9px;
      padding: 3px 10px;
    }

    .continue-indicator {
      bottom: 12px;
      right: 15px;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 13px solid #ff5e00;
    }
  }
</style>
