/**
 * Centralized development mode configuration
 *
 * All debug/dev tools should check this constant to determine if they should be enabled.
 * This is controlled by the VITE_DEV_MODE environment variable in .env
 *
 * Set VITE_DEV_MODE=true in .env to enable all debug tools
 * Set VITE_DEV_MODE=false in .env to disable all debug tools (production mode)
 */
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

/**
 * Check if development mode is enabled
 * @returns true if dev mode is active, false otherwise
 */
export function isDevMode(): boolean {
  return DEV_MODE;
}
