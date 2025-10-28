# Configuration

## Development Mode

All debug and development tools in this project are controlled by a single environment variable: `VITE_DEV_MODE`.

### How to Enable/Disable Dev Mode

Edit the `.env` file in the project root:

```bash
# Enable dev mode (shows all debug tools)
VITE_DEV_MODE=true

# Disable dev mode (production mode, hides all debug tools)
VITE_DEV_MODE=false
```

### What is Affected by Dev Mode

When `VITE_DEV_MODE=true`, the following features are enabled:

1. **Rectangle Draw Tool** - Press R + Drag to measure clickable areas
2. **Debug Rectangles** - Visual overlays showing all interactive zones
3. **Debug Buttons** - Scene skip buttons and session storage clearing on home page
4. **Mouse Position Debug** - Shows cursor coordinates
5. **Quiz Debug Info** - Additional debug information in quiz component
6. **Console Logging** - Additional debug logs throughout the application

When `VITE_DEV_MODE=false`, all these features are hidden and disabled.

### How to Use in Code

Import the centralized dev mode utility:

```typescript
import { isDevMode, DEV_MODE } from '../config/devMode';

// Option 1: Use as constant
if (DEV_MODE) {
  console.log('Dev mode is active');
}

// Option 2: Use as function (same behavior)
if (isDevMode()) {
  console.log('Dev mode is active');
}
```

### Legacy Code

Some older code may still use deprecated patterns:

```typescript
// ❌ DEPRECATED - Don't use
import.meta.env.DEV

// ❌ DEPRECATED - Don't use
import.meta.env.VITE_DEV_MODE === 'true'

// ✅ CORRECT - Use this instead
import { isDevMode } from '../config/devMode';
```

### Files Using Dev Mode

The following files have been updated to use centralized dev mode:

- `/src/config/devMode.ts` - **Central configuration**
- `/src/game/utils/DebugHelpers.ts` - Debug visualization helpers
- `/src/game/utils/RectangleDrawTool.ts` - Rectangle measurement tool
- `/src/routes/Home.svelte` - Home page with debug buttons
- `/src/ui/components/MousePositionDebug.svelte` - Mouse position display
- `/src/ui/components/Quiz.svelte` - Quiz component with debug info
- All scene files (BalconyScene, StairsScene, FachadaScene, etc.)

### Testing Dev Mode Toggle

To test if dev mode is working correctly:

1. Set `VITE_DEV_MODE=true` in `.env`
2. Restart the dev server (`pnpm dev`)
3. Navigate to the home page - you should see debug buttons
4. Enter any scene - you should see debug rectangles and the rectangle draw tool instructions

4. Set `VITE_DEV_MODE=false` in `.env`
5. Restart the dev server
6. Navigate to the home page - debug buttons should be hidden
7. Enter any scene - debug rectangles should be invisible
