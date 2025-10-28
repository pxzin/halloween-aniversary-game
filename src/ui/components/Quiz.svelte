<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EventBus } from '../../game/EventBus';
  import { quizData } from '../../game/data/quizQuestions';
  import { DEV_MODE } from '../../config/devMode';

  // Quiz state
  let isActive = $state(false);
  let currentPhase = $state(1);
  let currentQuestionIndex = $state(0);
  let currentQuestion = $state<any>(null);
  let selectedAnswer = $state<number | null>(null);
  let isAnswered = $state(false);
  let phaseProgress = $state(0); // Tracks progress within current phase

  // Phase configuration
  const phases = [
    { key: 'phase1', subphase: 'en_us', total: 2 },
    { key: 'phase1', subphase: 'pt_br', total: 2 },
    { key: 'phase1', subphase: 'it', total: 2 },
    { key: 'phase2', subphase: null, total: 3 },
    { key: 'phase3', subphase: null, total: 2 },
    { key: 'phase4', subphase: null, total: 1 }
  ];

  let currentPhaseIndex = $state(0);
  let questionsInCurrentPhase: any[] = $state([]);

  /**
   * Start the quiz
   */
  function startQuiz() {
    isActive = true;
    currentPhaseIndex = 0;
    currentQuestionIndex = 0;
    phaseProgress = 0;

    loadPhase();
    EventBus.emit('quiz-started');
  }

  /**
   * Load questions for current phase
   */
  function loadPhase() {
    const phase = phases[currentPhaseIndex];
    const phaseData = quizData[phase.key as keyof typeof quizData];

    if (phase.subphase && typeof phaseData === 'object' && !Array.isArray(phaseData)) {
      questionsInCurrentPhase = phaseData[phase.subphase as keyof typeof phaseData] || [];
    } else if (Array.isArray(phaseData)) {
      questionsInCurrentPhase = phaseData;
    } else {
      questionsInCurrentPhase = [];
    }

    currentQuestionIndex = 0;
    phaseProgress = 0;
    loadQuestion();
  }

  /**
   * Load current question
   */
  function loadQuestion() {
    if (currentQuestionIndex < questionsInCurrentPhase.length) {
      currentQuestion = questionsInCurrentPhase[currentQuestionIndex];
      selectedAnswer = null;
      isAnswered = false;
    }
  }

  /**
   * Handle answer selection
   */
  function selectAnswer(index: number) {
    if (isAnswered) return;

    selectedAnswer = index;
    isAnswered = true;

    // Wait a moment before moving to next question
    setTimeout(() => {
      nextQuestion();
    }, 1000);
  }

  /**
   * Move to next question or phase
   */
  function nextQuestion() {
    currentQuestionIndex++;
    phaseProgress++;

    if (currentQuestionIndex >= questionsInCurrentPhase.length) {
      // Move to next phase
      nextPhase();
    } else {
      loadQuestion();
    }
  }

  /**
   * Move to next phase or end quiz
   */
  function nextPhase() {
    currentPhaseIndex++;

    if (currentPhaseIndex >= phases.length) {
      // Quiz complete!
      endQuiz();
    } else {
      // Add transition delay
      setTimeout(() => {
        loadPhase();
      }, 500);
    }
  }

  /**
   * End the quiz
   */
  function endQuiz() {
    isActive = false;
    EventBus.emit('quiz-completed');
  }

  /**
   * Get phase display number (1-4 for user)
   */
  function getPhaseNumber(): number {
    const phase = phases[currentPhaseIndex];
    if (phase.key === 'phase1') {
      if (phase.subphase === 'en_us') return 1;
      if (phase.subphase === 'pt_br') return 1;
      if (phase.subphase === 'it') return 1;
    } else if (phase.key === 'phase2') return 2;
    else if (phase.key === 'phase3') return 3;
    else if (phase.key === 'phase4') return 4;
    return 1;
  }

  /**
   * Get visual glitch level based on phase
   */
  function getGlitchLevel(): number {
    const phaseNum = getPhaseNumber();
    return phaseNum;
  }

  /**
   * Get background color based on phase
   */
  function getBackgroundColor(): string {
    const level = getGlitchLevel();
    if (level === 1) return '#58cc02';
    if (level === 2) return '#ff9600';
    if (level === 3) return '#ff4b4b';
    return '#a020f0';
  }

  // Listen for start-quiz event
  onMount(() => {
    EventBus.on('start-quiz', startQuiz);
  });

  onDestroy(() => {
    EventBus.off('start-quiz', startQuiz);
  });
</script>

{#if isActive && currentQuestion}
  <div class="quiz-overlay" style="background-color: {getBackgroundColor()}">
    <div class="quiz-container glitch-{getGlitchLevel()}">
      <!-- Quiz Header -->
      <div class="quiz-header">
        <div class="phase-indicator">
          Phase {getPhaseNumber()} / 4
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: {(phaseProgress / phases[currentPhaseIndex].total) * 100}%"
          ></div>
        </div>
      </div>

      <!-- Dev Skip Button -->
      {#if DEV_MODE}
        <button class="dev-skip-button" onclick={endQuiz}>
          [DEV] Skip Quiz
        </button>
      {/if}

      <!-- Question Card -->
      <div class="question-card">
        <h2 class="question-text">{currentQuestion.question}</h2>

        <!-- Answer Options -->
        <div class="answers-container">
          {#each currentQuestion.answers as answer, index}
            <button
              class="answer-button"
              class:selected={selectedAnswer === index}
              class:correct={isAnswered && currentQuestion.correct !== undefined && currentQuestion.correct === index}
              class:incorrect={isAnswered && selectedAnswer === index && currentQuestion.correct !== undefined && currentQuestion.correct !== index}
              onclick={() => selectAnswer(index)}
              disabled={isAnswered}
            >
              {answer}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .quiz-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1500;
    transition: background-color 0.5s ease;
  }

  .quiz-container {
    width: min(600px, 90vw);
    max-height: 90vh;
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Glitch effects for different phases */
  .glitch-2 {
    animation: shake 0.5s infinite;
  }

  .glitch-3 {
    animation: shake 0.3s infinite, colorShift 1s infinite;
  }

  .glitch-4 {
    animation: shake 0.2s infinite, colorShift 0.5s infinite, distort 0.8s infinite;
    filter: hue-rotate(180deg);
  }

  @keyframes shake {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(-2px, 2px) rotate(-1deg); }
    50% { transform: translate(2px, -2px) rotate(1deg); }
    75% { transform: translate(-2px, -2px) rotate(-1deg); }
  }

  @keyframes colorShift {
    0%, 100% { filter: hue-rotate(0deg); }
    50% { filter: hue-rotate(15deg); }
  }

  @keyframes distort {
    0%, 100% { transform: scale(1, 1); }
    50% { transform: scale(1.02, 0.98); }
  }

  .quiz-header {
    margin-bottom: 24px;
  }

  .phase-indicator {
    font-size: 14px;
    font-weight: bold;
    color: #666;
    text-align: center;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e5e5e5;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #58cc02, #78d522);
    transition: width 0.3s ease;
  }

  .question-card {
    background: #f7f7f7;
    border-radius: 12px;
    padding: 24px;
  }

  .question-text {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 24px;
    text-align: center;
    line-height: 1.4;
  }

  @media (max-width: 600px) {
    .question-text {
      font-size: 20px;
    }
  }

  .answers-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .answer-button {
    padding: 16px 24px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    background: white;
    border: 3px solid #e5e5e5;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .answer-button:hover:not(:disabled) {
    border-color: #58cc02;
    transform: translateX(4px);
  }

  .answer-button:disabled {
    cursor: not-allowed;
  }

  .answer-button.selected {
    border-color: #58cc02;
    background: #f0f9e8;
  }

  .answer-button.correct {
    border-color: #58cc02;
    background: #d7f0c7;
    animation: success 0.5s ease;
  }

  .answer-button.incorrect {
    border-color: #ff4b4b;
    background: #ffe5e5;
    animation: error 0.5s ease;
  }

  @keyframes success {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes error {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }

  /* Dev Skip Button */
  .dev-skip-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    border: 2px solid rgba(255, 0, 0, 1);
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 10;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .dev-skip-button:hover {
    background: rgba(255, 0, 0, 1);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4);
  }

  .dev-skip-button:active {
    transform: scale(0.98);
  }

  @media (max-width: 600px) {
    .quiz-container {
      padding: 24px;
    }

    .answer-button {
      padding: 14px 20px;
      font-size: 16px;
    }
  }
</style>
