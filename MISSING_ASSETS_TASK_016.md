# Missing Assets - Task 016: Kitchen Scene / Frozen Treasure Puzzle

## Required Assets for Production

### 1. Ice Key Sprite ✅ COMPLETE
- **Location:** `public/assets/images/ui/ice_key.png`
- **Description:** Sprite for the ice keys scattered in the freezer
- **Status:** ✅ Implemented and working!
- **Usage:** 99 ice keys are collected from the freezer and added to inventory with quantity counter

### 2. Chocolates Sprite
- **Location:** `public/assets/images/ui/chocolates.png` (suggested)
- **Description:** Sprite for the chocolates gift
- **Current Placeholder:** 🍫 (chocolate emoji)
- **Usage:** Final reward revealed after collecting all 99 ice keys
- **Suggested Size:** Medium icon, around 48-64px

## Implementation Notes

## New Feature: Inventory Quantity System ✨

The inventory system has been updated to support items with quantities!

- **Interface Updated:** `Item` interface now has optional `quantity?: number` field
- **New Function:** `addItemToInventory(item, quantity)` in `stores.ts`
  - Automatically stacks items with the same ID
  - Updates quantity counter
- **UI Updated:** Inventory component now displays quantity badge for items with quantity > 1
- **Styling:** Orange quantity badge positioned on bottom-right of item icon

### Where to Update When Assets Are Ready:

1. **Ice Key Sprite:** ✅ DONE
   - Ice keys now use real sprite from `ice_key.png`
   - Added to inventory with quantity system
   - Counter updates automatically as player collects keys

2. **Chocolates Sprite:**
   - File: `src/game/scenes/KitchenScene.ts`
   - Method: `createFreezerZone()` and `revealChocolates()`
   - Lines: ~325 and ~505
   - Replace: `'🍫'` with `this.add.sprite()` using the chocolates image

3. **Preload Method:**
   - File: `src/game/scenes/KitchenScene.ts`
   - Method: `preload()`
   - Add load calls for both sprites (currently marked with TODO comments)

## Priority
- **Critical for production:** Yes
- **Deadline:** Before anniversary (24+ hours remaining)
- **Fallback:** Current emoji placeholders work but are not ideal for final release

## Testing Status
- Scene is fully functional with emoji placeholders
- All puzzle logic is implemented and working
- Navigation is connected properly
- Dialogues are in place

---
**Created:** 2025-10-30
**Task:** 016 - Implement Frozen Treasure Puzzle (Chocolates)
