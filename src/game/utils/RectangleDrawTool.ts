import Phaser from 'phaser';
import { isDev } from './DebugHelpers';

/**
 * Rectangle Draw Tool - Dev tool for measuring clickable areas
 *
 * Press 'R' key and drag with mouse to draw a rectangle.
 * After drawing, you can:
 * - Drag to move the rectangle
 * - Drag corners/edges to resize
 * - Press SPACE to log coordinates
 * - Press ESCAPE to clear and start over
 */

interface RectangleData {
  x: number;      // top-left corner
  y: number;
  width: number;
  height: number;
}

interface DrawState {
  mode: 'idle' | 'drawing' | 'editing';
  isDrawing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  startX: number;
  startY: number;
  dragOffsetX: number;
  dragOffsetY: number;
  resizeHandle: string | null;

  rect: RectangleData | null;
  graphics: Phaser.GameObjects.Graphics | null;
  rectVisual: Phaser.GameObjects.Rectangle | null;
  handles: Phaser.GameObjects.Graphics | null;
  instructionText: Phaser.GameObjects.Text | null;
  coordsText: Phaser.GameObjects.Text | null;
}

const drawState: DrawState = {
  mode: 'idle',
  isDrawing: false,
  isDragging: false,
  isResizing: false,
  startX: 0,
  startY: 0,
  dragOffsetX: 0,
  dragOffsetY: 0,
  resizeHandle: null,

  rect: null,
  graphics: null,
  rectVisual: null,
  handles: null,
  instructionText: null,
  coordsText: null,
};

const HANDLE_SIZE = 8;
const EDGE_THRESHOLD = 10;

function drawHandles(scene: Phaser.Scene, rect: RectangleData): void {
  if (!drawState.handles) {
    drawState.handles = scene.add.graphics();
    drawState.handles.setDepth(10001);
  }

  drawState.handles.clear();

  // Draw corner handles
  const corners = [
    { x: rect.x, y: rect.y, label: 'nw' },
    { x: rect.x + rect.width, y: rect.y, label: 'ne' },
    { x: rect.x, y: rect.y + rect.height, label: 'sw' },
    { x: rect.x + rect.width, y: rect.y + rect.height, label: 'se' },
  ];

  corners.forEach(corner => {
    drawState.handles!.fillStyle(0xffffff, 1);
    drawState.handles!.fillCircle(corner.x, corner.y, HANDLE_SIZE);
    drawState.handles!.lineStyle(2, 0x00ff00, 1);
    drawState.handles!.strokeCircle(corner.x, corner.y, HANDLE_SIZE);
  });

  // Draw edge midpoint handles
  const edges = [
    { x: rect.x + rect.width / 2, y: rect.y, label: 'n' },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height, label: 's' },
    { x: rect.x, y: rect.y + rect.height / 2, label: 'w' },
    { x: rect.x + rect.width, y: rect.y + rect.height / 2, label: 'e' },
  ];

  edges.forEach(edge => {
    drawState.handles!.fillStyle(0xffffff, 1);
    drawState.handles!.fillRect(edge.x - HANDLE_SIZE / 2, edge.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    drawState.handles!.lineStyle(2, 0x00ff00, 1);
    drawState.handles!.strokeRect(edge.x - HANDLE_SIZE / 2, edge.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
  });
}

function getHandleAtPosition(rect: RectangleData, x: number, y: number): string | null {
  const corners = [
    { x: rect.x, y: rect.y, label: 'nw' },
    { x: rect.x + rect.width, y: rect.y, label: 'ne' },
    { x: rect.x, y: rect.y + rect.height, label: 'sw' },
    { x: rect.x + rect.width, y: rect.y + rect.height, label: 'se' },
  ];

  // Check corners first (higher priority)
  for (const corner of corners) {
    const dist = Math.sqrt((x - corner.x) ** 2 + (y - corner.y) ** 2);
    if (dist <= HANDLE_SIZE + 2) {
      return corner.label;
    }
  }

  // Check edges
  const edges = [
    { x: rect.x + rect.width / 2, y: rect.y, label: 'n' },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height, label: 's' },
    { x: rect.x, y: rect.y + rect.height / 2, label: 'w' },
    { x: rect.x + rect.width, y: rect.y + rect.height / 2, label: 'e' },
  ];

  for (const edge of edges) {
    const dist = Math.sqrt((x - edge.x) ** 2 + (y - edge.y) ** 2);
    if (dist <= HANDLE_SIZE + 2) {
      return edge.label;
    }
  }

  return null;
}

function isInsideRect(rect: RectangleData, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.width &&
         y >= rect.y && y <= rect.y + rect.height;
}

function updateVisuals(scene: Phaser.Scene): void {
  if (!drawState.rect) return;

  const rect = drawState.rect;

  // Update rectangle
  if (drawState.rectVisual) {
    drawState.rectVisual.setPosition(rect.x, rect.y);
    drawState.rectVisual.setSize(rect.width, rect.height);
  }

  // Update border
  if (drawState.graphics) {
    drawState.graphics.clear();
    drawState.graphics.lineStyle(2, 0x00ff00, 1);
    drawState.graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  // Update handles
  drawHandles(scene, rect);

  // Update coords text
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  if (drawState.coordsText) {
    drawState.coordsText.destroy();
  }

  drawState.coordsText = scene.add.text(
    centerX,
    centerY,
    `${rect.width.toFixed(0)} x ${rect.height.toFixed(0)}\nCenter: ${centerX.toFixed(0)}, ${centerY.toFixed(0)}`,
    {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
      align: 'center',
    }
  );
  drawState.coordsText.setOrigin(0.5, 0.5);
  drawState.coordsText.setDepth(10002);
}

function logRectangle(rect: RectangleData): void {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📏 RECTANGLE COORDINATES:');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('// Top-left corner:');
  console.log(`const x = ${rect.x.toFixed(2)};`);
  console.log(`const y = ${rect.y.toFixed(2)};`);
  console.log(`const width = ${rect.width.toFixed(2)};`);
  console.log(`const height = ${rect.height.toFixed(2)};`);
  console.log('');
  console.log('// Center point (for createClickableRect):');
  console.log(`const centerX = ${centerX.toFixed(2)};`);
  console.log(`const centerY = ${centerY.toFixed(2)};`);
  console.log(`const width = ${rect.width.toFixed(2)};`);
  console.log(`const height = ${rect.height.toFixed(2)};`);
  console.log('');
  console.log('// Example usage:');
  console.log(`createClickableRect(this, ${centerX.toFixed(2)}, ${centerY.toFixed(2)}, ${rect.width.toFixed(2)}, ${rect.height.toFixed(2)}, true);`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
}

function clearRectangle(): void {
  if (drawState.graphics) {
    drawState.graphics.destroy();
    drawState.graphics = null;
  }
  if (drawState.rectVisual) {
    drawState.rectVisual.destroy();
    drawState.rectVisual = null;
  }
  if (drawState.handles) {
    drawState.handles.destroy();
    drawState.handles = null;
  }
  if (drawState.coordsText) {
    drawState.coordsText.destroy();
    drawState.coordsText = null;
  }

  drawState.rect = null;
  drawState.mode = 'idle';
  drawState.isDrawing = false;
  drawState.isDragging = false;
  drawState.isResizing = false;
  drawState.resizeHandle = null;

  if (drawState.instructionText) {
    drawState.instructionText.setText('Press R + Drag to draw rectangle');
  }
}

/**
 * Enable rectangle draw tool in a scene
 */
export function enableRectangleDrawTool(scene: Phaser.Scene): void {
  if (!isDev()) return;

  // Show instructions
  drawState.instructionText = scene.add.text(10, 10, 'Press R + Drag to draw rectangle', {
    fontSize: '14px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 },
  });
  drawState.instructionText.setDepth(10003);
  drawState.instructionText.setScrollFactor(0);

  // Listen for keyboard shortcuts
  scene.input.keyboard?.on('keydown-SPACE', () => {
    if (drawState.rect && drawState.mode === 'editing') {
      logRectangle(drawState.rect);
    }
  });

  scene.input.keyboard?.on('keydown-ESC', () => {
    clearRectangle();
  });

  // Listen for R key for UI feedback
  scene.input.keyboard?.on('keydown-R', () => {
    if (drawState.mode === 'idle') {
      drawState.instructionText?.setText('Drawing mode ON - Drag to draw');
      drawState.instructionText?.setBackgroundColor('#00ff00');
      drawState.instructionText?.setColor('#000000');
    }
  });

  scene.input.keyboard?.on('keyup-R', () => {
    if (drawState.mode === 'idle') {
      drawState.instructionText?.setText('Press R + Drag to draw rectangle');
      drawState.instructionText?.setBackgroundColor('#000000');
      drawState.instructionText?.setColor('#00ff00');
    }
  });

  // Handle pointer down
  scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    // Log mouse position for debugging alignment
    console.log(`[RectangleTool] Pointer down at:`, {
      'pointer.x': pointer.x,
      'pointer.y': pointer.y,
      'pointer.worldX': pointer.worldX,
      'pointer.worldY': pointer.worldY,
      'canvas.offsetLeft': scene.game.canvas.offsetLeft,
      'canvas.offsetTop': scene.game.canvas.offsetTop,
    });

    const rKey = scene.input.keyboard?.addKey('R');

    // MODE: IDLE - Start drawing with R key
    if (drawState.mode === 'idle' && rKey?.isDown) {
      drawState.mode = 'drawing';
      drawState.isDrawing = true;
      drawState.startX = pointer.x;
      drawState.startY = pointer.y;

      // Create graphics
      drawState.graphics = scene.add.graphics();
      drawState.graphics.setDepth(9999);

      drawState.rectVisual = scene.add.rectangle(
        pointer.x,
        pointer.y,
        1,
        1,
        0x00ff00,
        0.3
      );
      drawState.rectVisual.setDepth(9998);
      drawState.rectVisual.setOrigin(0, 0);

      drawState.rect = {
        x: pointer.x,
        y: pointer.y,
        width: 1,
        height: 1,
      };

      return;
    }

    // MODE: EDITING - Check for drag or resize
    if (drawState.mode === 'editing' && drawState.rect) {
      // Check if clicking on a handle
      const handle = getHandleAtPosition(drawState.rect, pointer.x, pointer.y);
      if (handle) {
        drawState.isResizing = true;
        drawState.resizeHandle = handle;
        drawState.startX = pointer.x;
        drawState.startY = pointer.y;
        console.log(`[RectangleTool] Started resizing from handle: ${handle}`);
        return;
      }

      // Check if clicking inside rectangle (drag)
      if (isInsideRect(drawState.rect, pointer.x, pointer.y)) {
        drawState.isDragging = true;
        drawState.dragOffsetX = pointer.x - drawState.rect.x;
        drawState.dragOffsetY = pointer.y - drawState.rect.y;
        console.log('[RectangleTool] Started dragging rectangle');
        return;
      }
    }
  });

  // Handle pointer move
  scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    // MODE: DRAWING
    if (drawState.isDrawing && drawState.rect) {
      const width = pointer.x - drawState.startX;
      const height = pointer.y - drawState.startY;

      drawState.rect.x = Math.min(drawState.startX, pointer.x);
      drawState.rect.y = Math.min(drawState.startY, pointer.y);
      drawState.rect.width = Math.abs(width);
      drawState.rect.height = Math.abs(height);

      updateVisuals(scene);
      return;
    }

    // MODE: DRAGGING
    if (drawState.isDragging && drawState.rect) {
      drawState.rect.x = pointer.x - drawState.dragOffsetX;
      drawState.rect.y = pointer.y - drawState.dragOffsetY;

      updateVisuals(scene);
      return;
    }

    // MODE: RESIZING
    if (drawState.isResizing && drawState.rect && drawState.resizeHandle) {
      const handle = drawState.resizeHandle;
      const rect = drawState.rect;
      const oldRight = rect.x + rect.width;
      const oldBottom = rect.y + rect.height;

      // Corner handles
      if (handle === 'nw') {
        rect.width = oldRight - pointer.x;
        rect.height = oldBottom - pointer.y;
        rect.x = pointer.x;
        rect.y = pointer.y;
      } else if (handle === 'ne') {
        rect.width = pointer.x - rect.x;
        rect.height = oldBottom - pointer.y;
        rect.y = pointer.y;
      } else if (handle === 'sw') {
        rect.width = oldRight - pointer.x;
        rect.height = pointer.y - rect.y;
        rect.x = pointer.x;
      } else if (handle === 'se') {
        rect.width = pointer.x - rect.x;
        rect.height = pointer.y - rect.y;
      }
      // Edge handles
      else if (handle === 'n') {
        rect.height = oldBottom - pointer.y;
        rect.y = pointer.y;
      } else if (handle === 's') {
        rect.height = pointer.y - rect.y;
      } else if (handle === 'w') {
        rect.width = oldRight - pointer.x;
        rect.x = pointer.x;
      } else if (handle === 'e') {
        rect.width = pointer.x - rect.x;
      }

      // Prevent negative dimensions
      if (rect.width < 10) rect.width = 10;
      if (rect.height < 10) rect.height = 10;

      updateVisuals(scene);
      return;
    }

    // Update cursor based on hover
    if (drawState.mode === 'editing' && drawState.rect) {
      const handle = getHandleAtPosition(drawState.rect, pointer.x, pointer.y);

      if (handle) {
        // Set cursor based on handle
        const cursors: Record<string, string> = {
          'nw': 'nwse-resize',
          'ne': 'nesw-resize',
          'sw': 'nesw-resize',
          'se': 'nwse-resize',
          'n': 'ns-resize',
          's': 'ns-resize',
          'w': 'ew-resize',
          'e': 'ew-resize',
        };
        scene.game.canvas.style.cursor = cursors[handle] || 'pointer';
      } else if (isInsideRect(drawState.rect, pointer.x, pointer.y)) {
        scene.game.canvas.style.cursor = 'move';
      } else {
        scene.game.canvas.style.cursor = 'default';
      }
    }
  });

  // Handle pointer up
  scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
    console.log(`[RectangleTool] Pointer up at:`, {
      'pointer.x': pointer.x,
      'pointer.y': pointer.y,
    });

    // Finish drawing
    if (drawState.isDrawing && drawState.rect) {
      drawState.isDrawing = false;
      drawState.mode = 'editing';

      updateVisuals(scene);
      logRectangle(drawState.rect);

      drawState.instructionText?.setText('SPACE: Log coords | ESC: Clear | Drag to move | Drag handles to resize');
      drawState.instructionText?.setBackgroundColor('#0000ff');
      drawState.instructionText?.setColor('#ffffff');

      return;
    }

    // Finish dragging
    if (drawState.isDragging) {
      drawState.isDragging = false;
      if (drawState.rect) {
        logRectangle(drawState.rect);
      }
      return;
    }

    // Finish resizing
    if (drawState.isResizing) {
      drawState.isResizing = false;
      drawState.resizeHandle = null;
      if (drawState.rect) {
        logRectangle(drawState.rect);
      }
      return;
    }
  });
}
