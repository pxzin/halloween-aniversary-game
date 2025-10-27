import { dialogue } from '../../ui/stores';
import { EventBus } from '../EventBus';

/**
 * Dialogue line interface
 */
export interface DialogueLine {
  speaker: string;
  text: string;
}

/**
 * Dialogue script interface
 */
export interface DialogueScript {
  id: string;
  lines: DialogueLine[];
}

/**
 * Dialogue Manager - handles conversation logic and progression
 */
class DialogueManagerClass {
  private currentScript: DialogueScript | null = null;
  private currentLineIndex: number = 0;

  /**
   * Load a dialogue script by ID, optionally specifying a section
   * @param scriptId - The name of the JSON file (without .json extension)
   * @param section - Optional section name within the JSON file (for multi-section files)
   */
  async loadScript(scriptId: string, section?: string): Promise<void> {
    try {
      // Fetch the JSON file from the dialogues directory
      const response = await fetch(`/src/game/data/dialogues/${scriptId}.json`);

      if (!response.ok) {
        throw new Error(`Failed to load dialogue script: ${scriptId}`);
      }

      const data = await response.json();

      // If a section is specified, extract that section
      if (section) {
        if (data[section]) {
          this.currentScript = data[section];
        } else {
          throw new Error(`Section '${section}' not found in script '${scriptId}'`);
        }
      } else {
        // Otherwise, use the entire JSON as the script
        this.currentScript = data;
      }

      this.currentLineIndex = 0;

      console.log(`Dialogue script loaded: ${scriptId}${section ? ` (section: ${section})` : ''}`);
    } catch (error) {
      console.error('Error loading dialogue script:', error);
      this.currentScript = null;
    }
  }

  /**
   * Start the current dialogue script
   */
  startDialogue(): void {
    if (!this.currentScript || this.currentScript.lines.length === 0) {
      console.error('No dialogue script loaded or script is empty');
      return;
    }

    this.currentLineIndex = 0;
    this.showCurrentLine();
  }

  /**
   * Advance to the next line in the dialogue
   */
  advanceDialogue(): void {
    if (!this.currentScript) {
      return;
    }

    this.currentLineIndex++;

    // Check if we've reached the end
    if (this.currentLineIndex >= this.currentScript.lines.length) {
      this.endDialogue();
      return;
    }

    this.showCurrentLine();
  }

  /**
   * Go back to the previous line in the dialogue
   */
  goBackDialogue(): void {
    if (!this.currentScript) {
      return;
    }

    // Don't go back if we're at the first line
    if (this.currentLineIndex <= 0) {
      console.log('Already at the first dialogue line');
      return;
    }

    this.currentLineIndex--;
    this.showCurrentLine();
  }

  /**
   * Show the current line
   */
  private showCurrentLine(): void {
    if (!this.currentScript) {
      return;
    }

    const line = this.currentScript.lines[this.currentLineIndex];

    // Update the dialogue store with the current line
    dialogue.set({
      character: line.speaker,
      text: line.text
    });

    // Emit event for components to react
    EventBus.emit('dialogue-line-start', line);
  }

  /**
   * End the current dialogue
   */
  private endDialogue(): void {
    console.log('Dialogue ended');

    // Clear the dialogue
    dialogue.set(null);

    // Emit event for dialogue end
    EventBus.emit('dialogue-ended');

    // Reset state
    this.currentScript = null;
    this.currentLineIndex = 0;
  }

  /**
   * Get current script info
   */
  getCurrentScript(): DialogueScript | null {
    return this.currentScript;
  }

  /**
   * Get current line index
   */
  getCurrentLineIndex(): number {
    return this.currentLineIndex;
  }

  /**
   * Check if dialogue is active
   */
  isActive(): boolean {
    return this.currentScript !== null;
  }
}

// Export singleton instance
export const DialogueManager = new DialogueManagerClass();
