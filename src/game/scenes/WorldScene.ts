import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { inventory, selectedItem } from '../../ui/stores';
import { InteractionService } from '../services/InteractionService';
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
      { id: 'lighter', name: 'Isqueiro' },
      { id: 'cat_food_can', name: 'Lata de Ração' },
      { id: 'mini_rake', name: 'Mini Rastelo' }
    ]);

    // Create clickable test objects
    this.createTestObject(200, 300, 'Churrasqueira', 'grill_with_sanitizer');
    this.createTestObject(600, 300, 'Mesa', 'table');

    // Show welcome dialogue
    EventBus.emit('show-dialogue', {
      character: 'jessica',
      text: 'Onde eu estou? O que aconteceu? Preciso encontrar uma forma de sair daqui...'
    });

    // Instructions text
    this.add.text(400, 550, 'Clique nos objetos para interagir\nUse itens do inventário nos objetos', {
      fontSize: '14px',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Create a clickable test object
   */
  private createTestObject(x: number, y: number, label: string, objectId: string): void {
    // Create a rectangle as placeholder
    const rect = this.add.rectangle(x, y, 120, 120, 0x3d3d3d);
    rect.setStrokeStyle(2, 0xff6b35);
    rect.setInteractive({ useHandCursor: true });

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
