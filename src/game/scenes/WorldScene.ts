import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { inventory, selectedItem } from '../../ui/stores';
import { InteractionService } from '../services/InteractionService';
import { DialogueManager } from '../services/DialogueManager';
import { get } from 'svelte/store';

/**
 * World Scene - main gameplay scene for point-and-click adventure
 * This is where the player will navigate through different locations
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  create(): void {
    // Emit event to hide main menu UI
    EventBus.emit('hide-main-menu');

    // Set background color
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Add title text
    this.add.text(400, 50, 'World Scene - Test Area', {
      fontSize: '24px',
      color: '#ff6b35'
    }).setOrigin(0.5);

    // Add test items to inventory
    inventory.set([
      { id: 'lighter', name: 'Isqueiro', icon: '🔥' },
      { id: 'cat_food_can', name: 'Lata de Ração', icon: '🥫' },
      { id: 'mini_rake', name: 'Mini Rastelo', icon: '🧹' }
    ]);

    // Create clickable test objects
    this.createTestObject(200, 300, 'Churrasqueira', 'grill_with_sanitizer');
    this.createTestObject(600, 300, 'Mesa', 'table');

    // Create test button for DialogueManager
    this.createDialogueTestButton(400, 400);

    // Instructions text
    this.add.text(400, 550, 'Clique nos objetos para interagir\nClique no botão "Test Dialogue" para testar o novo sistema', {
      fontSize: '14px',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Create a test button to trigger the sample dialogue
   */
  private createDialogueTestButton(x: number, y: number): void {
    const button = this.add.rectangle(x, y, 250, 60, 0x58cc02);
    button.setStrokeStyle(3, 0xffffff);
    button.setInteractive();
    button.setDepth(10); // Ensure it's on top

    const buttonText = this.add.text(x, y, 'Test Dialogue System', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    buttonText.setDepth(11); // Text on top of button

    // Handle click
    button.on('pointerdown', async () => {
      await DialogueManager.loadScript('sample');
      DialogueManager.startDialogue();
    });

    // Hover effect
    button.on('pointerover', () => {
      button.setFillStyle(0x7aef34);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x58cc02);
    });
  }

  /**
   * Create a clickable test object
   */
  private createTestObject(x: number, y: number, label: string, objectId: string): void {
    // Create a rectangle as placeholder
    const rect = this.add.rectangle(x, y, 120, 120, 0x3d3d3d);
    rect.setStrokeStyle(2, 0xff6b35);
    rect.setInteractive();

    // Add label
    this.add.text(x, y, label, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Handle click
    rect.on('pointerdown', () => {
      const selected = get(selectedItem);

      if (selected) {
        // Using an item on this object
        const success = InteractionService.useItemOnObject(selected, objectId);

        if (success) {
          EventBus.emit('show-dialogue', {
            character: 'jessica',
            text: `Usei ${selected.name} na ${label}!`
          });
        }

        // Deselect item after interaction
        selectedItem.set(null);
      } else {
        // Just examining the object
        EventBus.emit('show-dialogue', {
          character: 'jessica',
          text: `É uma ${label}. Talvez eu possa usar algo nela?`
        });
      }
    });

    // Hover effect
    rect.on('pointerover', () => {
      rect.setFillStyle(0x4d4d4d);
    });

    rect.on('pointerout', () => {
      rect.setFillStyle(0x3d3d3d);
    });
  }
}
