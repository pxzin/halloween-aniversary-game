import Phaser from 'phaser';
import { isDevMode } from '../../config/devMode';

/**
 * Debug Helpers - Utilities for debugging and visualizing game elements
 * These helpers are only active when VITE_DEV_MODE=true in .env
 */

/**
 * Global state for debug visibility toggle
 */
let debugVisualsVisible = true;
const debugElements: Array<{
  rectangle?: Phaser.GameObjects.Rectangle;
  graphics?: Phaser.GameObjects.Graphics;
  text?: Phaser.GameObjects.Text;
}> = [];

/**
 * Toggle visibility of all debug visuals
 * Called when Alt key is pressed in dev mode
 */
export function toggleDebugVisibility(): void {
  if (!isDev()) return;

  debugVisualsVisible = !debugVisualsVisible;
  console.log(`[DebugHelpers] Debug visuals ${debugVisualsVisible ? 'VISIBLE' : 'HIDDEN'}`);

  // Update all registered debug elements
  debugElements.forEach(element => {
    if (element.rectangle) {
      element.rectangle.setAlpha(debugVisualsVisible ? 0.3 : 0);
    }
    if (element.graphics) {
      element.graphics.setVisible(debugVisualsVisible);
    }
    if (element.text) {
      element.text.setVisible(debugVisualsVisible);
    }
  });
}

/**
 * Get current debug visibility state
 */
export function isDebugVisible(): boolean {
  return debugVisualsVisible;
}

/**
 * Clear all registered debug elements (called when scene shuts down)
 */
export function clearDebugElements(): void {
  debugElements.length = 0;
}

/**
 * Enable debug visibility toggle with Alt key for a scene
 * Call this in the create() method of your scene
 * @param scene - The Phaser scene to enable toggle for
 */
export function enableDebugToggle(scene: Phaser.Scene): void {
  if (!isDev()) return;

  // Add keyboard listener for Alt key
  scene.input.keyboard?.on('keydown-ALT', () => {
    toggleDebugVisibility();
  });

  console.log('[DebugHelpers] Debug toggle enabled - Press ALT to toggle visibility');
}

/**
 * Check if we're in development mode
 * @deprecated Use isDevMode() from config/devMode instead
 */
export function isDev(): boolean {
  return isDevMode();
}

/**
 * Draw a debug rectangle over an interactive zone
 * @param scene - The Phaser scene
 * @param x - X position (center)
 * @param y - Y position (center)
 * @param width - Width of the zone
 * @param height - Height of the zone
 * @param color - Debug color (default: red)
 * @param label - Optional label to display
 * @returns The created graphics object
 */
export function drawDebugRect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number = 0xff0000,
  label?: string
): Phaser.GameObjects.Graphics | null {
  if (!isDev()) return null;

  const graphics = scene.add.graphics();

  // Draw filled rectangle with transparency
  graphics.fillStyle(color, 0.2);
  graphics.fillRect(x - width / 2, y - height / 2, width, height);

  // Draw border
  graphics.lineStyle(2, color, 1);
  graphics.strokeRect(x - width / 2, y - height / 2, width, height);

  // Draw crosshair at center
  const crosshairSize = 10;
  graphics.lineStyle(2, color, 1);
  graphics.beginPath();
  graphics.moveTo(x - crosshairSize, y);
  graphics.lineTo(x + crosshairSize, y);
  graphics.moveTo(x, y - crosshairSize);
  graphics.lineTo(x, y + crosshairSize);
  graphics.strokePath();

  // Add label if provided
  if (label) {
    const text = scene.add.text(x, y - height / 2 - 20, label, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
      padding: { x: 8, y: 4 },
    });
    text.setOrigin(0.5, 1);
  }

  return graphics;
}

/**
 * Draw a debug polygon over an interactive area
 * @param scene - The Phaser scene
 * @param points - Array of points [{x, y}, {x, y}, ...]
 * @param color - Debug color (default: red)
 * @param label - Optional label to display
 * @returns The created graphics object
 */
export function drawDebugPolygon(
  scene: Phaser.Scene,
  points: { x: number; y: number }[],
  color: number = 0xff0000,
  label?: string
): Phaser.GameObjects.Graphics | null {
  if (!isDev()) return null;

  const graphics = scene.add.graphics();

  // Draw filled polygon with transparency
  graphics.fillStyle(color, 0.2);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();

  // Draw border
  graphics.lineStyle(2, color, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.strokePath();

  // Draw vertices
  graphics.fillStyle(color, 1);
  points.forEach((point, index) => {
    graphics.fillCircle(point.x, point.y, 4);

    // Add vertex numbers
    const vertexText = scene.add.text(point.x + 10, point.y - 10, `${index}`, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
      padding: { x: 4, y: 2 },
    });
    vertexText.setOrigin(0, 1);
  });

  // Add label if provided
  if (label) {
    // Calculate center of polygon
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    const text = scene.add.text(centerX, centerY, label, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
      padding: { x: 8, y: 4 },
    });
    text.setOrigin(0.5, 0.5);
  }

  return graphics;
}

/**
 * Draw a debug circle over an interactive area
 * @param scene - The Phaser scene
 * @param x - X position (center)
 * @param y - Y position (center)
 * @param radius - Radius of the circle
 * @param color - Debug color (default: red)
 * @param label - Optional label to display
 * @returns The created graphics object
 */
export function drawDebugCircle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  color: number = 0xff0000,
  label?: string
): Phaser.GameObjects.Graphics | null {
  if (!isDev()) return null;

  const graphics = scene.add.graphics();

  // Draw filled circle with transparency
  graphics.fillStyle(color, 0.2);
  graphics.fillCircle(x, y, radius);

  // Draw border
  graphics.lineStyle(2, color, 1);
  graphics.strokeCircle(x, y, radius);

  // Draw crosshair at center
  const crosshairSize = 10;
  graphics.lineStyle(2, color, 1);
  graphics.beginPath();
  graphics.moveTo(x - crosshairSize, y);
  graphics.lineTo(x + crosshairSize, y);
  graphics.moveTo(x, y - crosshairSize);
  graphics.lineTo(x, y + crosshairSize);
  graphics.strokePath();

  // Add label if provided
  if (label) {
    const text = scene.add.text(x, y - radius - 20, label, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
      padding: { x: 8, y: 4 },
    });
    text.setOrigin(0.5, 1);
  }

  return graphics;
}

/**
 * Debug colors for different types of interactive areas
 */
export const DEBUG_COLORS = {
  CLICKABLE: 0xff0000,    // Red - clickable areas
  TRIGGER: 0x00ff00,      // Green - trigger zones
  COLLIDER: 0x0000ff,     // Blue - collision areas
  HOTSPOT: 0xffff00,      // Yellow - hotspots
  NAVIGATION: 0xff00ff,   // Magenta - navigation points
  ITEM: 0x00ffff,         // Cyan - item locations
} as const;

/**
 * Create a clickable rectangle that draws itself when showDebug is true
 * This ensures the clickable area and visual representation are EXACTLY the same
 *
 * @param scene - The Phaser scene
 * @param centerX - X position of center
 * @param centerY - Y position of center
 * @param width - Width of the rectangle
 * @param height - Height of the rectangle
 * @param showDebug - Whether to show visual representation (default: true in dev, false in prod)
 * @param color - Color when debug is shown (default: red)
 * @param label - Optional label to display
 * @returns The clickable rectangle
 */
export function createClickableRect(
  scene: Phaser.Scene,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  showDebug: boolean = isDev(),
  color: number = DEBUG_COLORS.CLICKABLE,
  label?: string
): Phaser.GameObjects.Rectangle {
  // Create a rectangle at the center position
  // When showDebug is false, it's invisible (alpha 0)
  // When showDebug is true, it's semi-transparent with the specified color
  const rect = scene.add.rectangle(
    centerX,
    centerY,
    width,
    height,
    color,
    showDebug ? (debugVisualsVisible ? 0.3 : 0) : 0  // Respect toggle state
  );

  // Rectangle has origin (0.5, 0.5) by default - center point
  rect.setInteractive({ useHandCursor: true });

  let graphics: Phaser.GameObjects.Graphics | undefined;
  let text: Phaser.GameObjects.Text | undefined;

  // If debug is enabled, add visual indicators
  if (showDebug) {
    // Create graphics for border and crosshair
    graphics = scene.add.graphics();
    graphics.setVisible(debugVisualsVisible); // Respect toggle state

    // Draw border
    graphics.lineStyle(2, color, 1);
    graphics.strokeRect(
      centerX - width / 2,
      centerY - height / 2,
      width,
      height
    );

    // Draw crosshair at center
    const crosshairSize = 10;
    graphics.lineStyle(2, color, 1);
    graphics.beginPath();
    graphics.moveTo(centerX - crosshairSize, centerY);
    graphics.lineTo(centerX + crosshairSize, centerY);
    graphics.moveTo(centerX, centerY - crosshairSize);
    graphics.lineTo(centerX, centerY + crosshairSize);
    graphics.strokePath();

    // Add label if provided
    if (label) {
      text = scene.add.text(centerX, centerY - height / 2 - 20, label, {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
        padding: { x: 8, y: 4 },
      });
      text.setOrigin(0.5, 1);
      text.setVisible(debugVisualsVisible); // Respect toggle state
    }

    // Register elements for toggle functionality
    debugElements.push({
      rectangle: rect,
      graphics: graphics,
      text: text,
    });

    // Log creation
    console.log(`[DebugHelpers] Created clickable rect:`, {
      label,
      center: { x: centerX, y: centerY },
      dimensions: { width, height },
      bounds: {
        left: centerX - width / 2,
        right: centerX + width / 2,
        top: centerY - height / 2,
        bottom: centerY + height / 2,
      }
    });
  }

  return rect;
}

/**
 * DEPRECATED: Use createClickableRect instead
 * This function is kept for backwards compatibility but should not be used
 */
export function createInteractiveRect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number = 0xff0000,
  label?: string
): Phaser.GameObjects.Rectangle {
  console.warn('[DebugHelpers] createInteractiveRect is deprecated, use createClickableRect instead');
  return createClickableRect(scene, x, y, width, height, isDev(), color, label);
}

/**
 * Create an interactive polygon zone with optional debug visualization
 * @param scene - The Phaser scene
 * @param points - Array of points [{x, y}, {x, y}, ...]
 * @param color - Debug color (default: red)
 * @param label - Optional label to display
 * @returns The interactive zone with polygon hitArea
 */
export function createInteractivePolygon(
  scene: Phaser.Scene,
  points: { x: number; y: number }[],
  color: number = 0xff0000,
  label?: string
): Phaser.GameObjects.Zone {
  // Calculate bounding box for the zone
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const width = maxX - minX;
  const height = maxY - minY;

  // Create the zone
  const zone = scene.add.zone(centerX, centerY, width, height);

  // IMPORTANT: Set origin to center (0.5, 0.5)
  zone.setOrigin(0.5, 0.5);

  // Convert points to be relative to zone center
  const relativePoints = points.map(p => ({
    x: p.x - centerX,
    y: p.y - centerY,
  }));

  // Create polygon hitArea
  const polygon = new Phaser.Geom.Polygon(relativePoints);
  zone.setInteractive({ hitArea: polygon, hitAreaCallback: Phaser.Geom.Polygon.Contains, useHandCursor: true });

  // Draw debug visualization in dev mode
  if (isDev()) {
    drawDebugPolygon(scene, points, color, label);
  }

  return zone;
}

/**
 * Create an interactive circular zone with optional debug visualization
 * @param scene - The Phaser scene
 * @param x - X position (center)
 * @param y - Y position (center)
 * @param radius - Radius of the circle
 * @param color - Debug color (default: red)
 * @param label - Optional label to display
 * @returns The interactive zone with circle hitArea
 */
export function createInteractiveCircle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  color: number = 0xff0000,
  label?: string
): Phaser.GameObjects.Zone {
  // Create the zone
  const zone = scene.add.zone(x, y, radius * 2, radius * 2);

  // IMPORTANT: Set origin to center (0.5, 0.5)
  zone.setOrigin(0.5, 0.5);

  // Create circle hitArea centered at (0,0) relative to the zone
  const circle = new Phaser.Geom.Circle(0, 0, radius);
  zone.setInteractive({
    hitArea: circle,
    hitAreaCallback: Phaser.Geom.Circle.Contains,
    useHandCursor: true
  });

  // Draw debug visualization in dev mode
  if (isDev()) {
    drawDebugCircle(scene, x, y, radius, color, label);
  }

  return zone;
}
