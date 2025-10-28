import Phaser from 'phaser';

/**
 * Debug Helpers - Utilities for debugging and visualizing game elements
 * These helpers are only active in development mode
 */

/**
 * Check if we're in development mode
 */
export function isDev(): boolean {
  return import.meta.env.DEV;
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
 * Create an interactive rectangular zone with optional debug visualization
 * @param scene - The Phaser scene
 * @param x - X position (center)
 * @param y - Y position (center)
 * @param width - Width of the zone
 * @param height - Height of the zone
 * @param color - Debug color (default: red)
 * @param label - Optional label to display
 * @returns The interactive zone
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
  // Create an INVISIBLE rectangle at the center position
  // Using Rectangle instead of Zone for more predictable behavior
  const rect = scene.add.rectangle(x, y, width, height, 0x000000, 0);

  // Rectangle has origin (0.5, 0.5) by default, which is what we want
  // This means x,y is the center, and bounds are calculated correctly

  // IMPORTANT: Explicitly define the hitArea to ensure exact bounds
  // The hitArea is in LOCAL coordinates relative to the object's origin
  const hitArea = new Phaser.Geom.Rectangle(
    -width / 2,  // x offset from origin (left edge)
    -height / 2, // y offset from origin (top edge)
    width,
    height
  );

  rect.setInteractive({
    hitArea,
    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    useHandCursor: true
  });

  // Draw debug visualization in dev mode
  if (isDev()) {
    drawDebugRect(scene, x, y, width, height, color, label);

    // Log the actual bounds of the Rectangle for comparison
    console.log(`[DebugHelpers] Created Rectangle:`, {
      label,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      originX: rect.originX,
      originY: rect.originY,
      worldBounds: {
        left: rect.x - rect.width * rect.originX,
        right: rect.x + rect.width * (1 - rect.originX),
        top: rect.y - rect.height * rect.originY,
        bottom: rect.y + rect.height * (1 - rect.originY),
      },
      hitArea: {
        x: hitArea.x,
        y: hitArea.y,
        width: hitArea.width,
        height: hitArea.height,
        // Calculate world bounds of hitArea
        worldLeft: rect.x + hitArea.x,
        worldRight: rect.x + hitArea.x + hitArea.width,
        worldTop: rect.y + hitArea.y,
        worldBottom: rect.y + hitArea.y + hitArea.height,
      }
    });
  }

  return rect;
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
