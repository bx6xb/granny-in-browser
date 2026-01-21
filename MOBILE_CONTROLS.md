# Mobile & Tablet Controls

## Overview

Your Haunted House game now has full touch controls for mobile and tablet devices! Players can enjoy the same immersive experience on touch-enabled devices.

## Mobile Features

### Auto-Detection
- Automatically detects touch-enabled devices (phones & tablets)
- Shows mobile controls only when needed (screen width ≤ 1024px)
- Desktop users continue to use keyboard & mouse

### Touch Controls

#### Movement (Left Side)
- **Touch & Drag Left Side** - Virtual joystick appears where you touch
- Drag in any direction to move the player
- Movement is proportional to joystick displacement
- Release to stop moving

#### Camera Control (Right Side)
- **Touch & Drag Right Side** - Look around
- Drag up/down to look up/down (clamped vertical rotation)
- Drag left/right for 360° horizontal rotation
- Smooth and responsive camera movement

#### Action Buttons (Bottom Right)
- **E Button (Green)** - Interact with doors, objects, etc.
- **F Button (Blue)** - Grab items
- **Space Button (Orange)** - Drop held item (only visible when holding an item)
- **C Button (Purple)** - Toggle crouch

### On-Screen Instructions
- Touch instructions appear at bottom left
- Shows "Touch left to move" and "Drag right to look"
- Control hints shown in top left corner (minimized on mobile)

## Technical Details

### Files Added/Modified

#### New Files:
1. `src/components/MobileControls.tsx` - Mobile touch control system

#### Modified Files:
1. `src/components/Player.tsx` - Integrated mobile controls with player movement
2. `src/components/GameUI.tsx` - Made UI responsive for mobile devices
3. `src/index.css` - Added mobile-specific CSS optimizations
4. `index.html` - Updated viewport meta tag for mobile gaming

### Mobile Optimizations

#### CSS Improvements:
- Prevented pull-to-refresh on mobile browsers
- Disabled text selection for better touch experience
- Fixed scrolling/overscroll behavior
- Optimized button touch targets (minimum 44px × 44px)

#### Performance:
- Touch events use `preventDefault()` to avoid browser conflicts
- Efficient touch tracking with identifier-based system
- Reusable camera rotation calculations
- No performance impact on desktop users

### Touch Sensitivity
- Joystick: 50px maximum radius with smooth clamping
- Camera rotation: 0.002 sensitivity factor for precise control
- Movement threshold: 10px to prevent accidental input

## How It Works

### Virtual Joystick
1. Touch anywhere on left half of screen
2. Joystick appears at touch point
3. Drag finger to control movement direction
4. Visual feedback with moving thumb indicator
5. Release to reset and hide joystick

### Camera Touch
1. Touch and drag anywhere on right half of screen
2. Tracks finger movement delta from initial touch
3. Converts to camera rotation (Euler angles)
4. Vertical rotation clamped to prevent flipping
5. Horizontal rotation unrestricted (360°)

### Action Buttons
- Use `touchstart` events for instant response
- All action logic reused from keyboard handlers
- Buttons disabled during menus, game over, day transitions
- Dynamic visibility (Drop button only when holding item)

## Browser Compatibility

Tested on:
- iOS Safari (iPhone & iPad)
- Android Chrome
- Modern mobile browsers with touch support

## Known Limitations

1. **Pointer Lock** - Mobile devices don't support pointer lock, so camera control is purely touch-based (no cursor capture)
2. **Well Handle** - Hold E button for continuous well usage (tap and hold, similar to keyboard)
3. **Screen Size** - Optimized for phones & tablets (≤ 1024px width)

## Customization

### Adjust Touch Sensitivity
Edit `src/components/MobileControls.tsx`:

```typescript
const sensitivity = 0.002; // Lower = less sensitive, Higher = more sensitive
```

### Adjust Joystick Size
Edit joystick dimensions:

```typescript
// Joystick base
width: '120px',
height: '120px',

// Thumb
width: '50px',
height: '50px',

// Max radius
const maxDistance = 50; // Change this value
```

### Button Positions
All buttons positioned with inline styles for easy customization:

```typescript
bottom: '20px',
right: '20px',
```

## Tips for Mobile Players

1. **Use Two Hands** - Left hand for movement, right hand for camera
2. **Smooth Movements** - Small joystick movements for precision
3. **Quick Turns** - Swipe right side for fast camera rotation
4. **Action Buttons** - Positioned for right thumb access
5. **Crouch** - Remember to crouch to fit through small spaces

## Future Improvements

Potential enhancements:
- Haptic feedback for interactions
- Customizable button layouts
- Adjustable sensitivity settings in-game
- Portrait mode support
- Gesture controls (pinch, swipe, etc.)

---

**Enjoy playing Haunted House on your mobile device!**
