# First-Person Controls - Haunted House Game

## Overview

Your game now has a fully functional first-person controller with physics-based movement!

## Controls

### Movement

- **W** - Move Forward
- **A** - Move Left
- **S** - Move Backward
- **D** - Move Right
- **C** - Crouch (hold to stay crouched)

### Camera

- **Mouse** - Look around (360° rotation)
- **Click** anywhere to lock the mouse pointer (required for camera control)
- **ESC** - Release mouse pointer

## Technical Details

### Player Configuration

- **Standing Height**: 1.7m above the floor (eye-level camera)
- **Crouch Height**: 0.9m (adjustable in `Player.tsx` - change `CROUCH_HEIGHT` constant)
- **Movement Speed**: 5 units/second
- **Crouch Speed**: 2.5 units/second (50% slower when crouching)
- **Mass**: 80kg (for realistic physics)

### Physics

- Uses Rapier physics engine for realistic collision detection
- Dynamic capsule collider that shrinks when crouching
- Crouch to fit through small holes and tight spaces
- Gravity keeps player grounded

### Spawn Position

- Player spawns at coordinates defined in `usePlayerState.ts` store
- Position is set from the `spawn_player` object in your 3D model

## Files Added/Modified

### New Files:

1. `src/components/Player.tsx` - First-person player controller
2. `src/components/GameUI.tsx` - On-screen controls instructions
3. `CONTROLS.md` - This file

### Modified Files:

1. `src/App.tsx` - Added Physics wrapper and Player component
2. `src/components/HauntedHouse.tsx` - Added physics colliders to the house

## How It Works

1. **Player Component**: Creates a physics-based capsule collider that represents the player
2. **Keyboard Input**: Captures WASD keys for movement direction, C/Ctrl for crouching
3. **Mouse Control**: Uses PointerLockControls for FPS-style camera rotation
4. **Physics Movement**: Applies forces to the rigid body for realistic movement
5. **Dynamic Collider**: Capsule collider height changes in real-time when crouching
6. **Camera Sync**: Camera position follows the player's position + current height (standing or crouching)

## Customization

Want to adjust the crouch height to fit through specific holes? Edit `src/components/Player.tsx`:

```typescript
const CROUCH_HEIGHT = 0.9; // Change this value (in meters)
```

- Lower values = shorter crouch (fit through smaller spaces)
- Higher values = taller crouch (less extreme crouch)

## Testing

Open http://localhost:5173/ in your browser to test the controls!
