import { useEffect, useRef, useState } from 'react';
import { useItems } from '../store/useItems';
import { useMobileControls } from '../store/useMobileControls';
import { usePlayerState } from '../store/usePlayerState';

interface TouchPosition {
  x: number;
  y: number;
  id: number;
}

interface MobileControlsProps {
  disabled?: boolean;
}

// Movement state shared between components
export const mobileMovement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  crouch: false,
};

export function MobileControls({ disabled = false }: MobileControlsProps) {
  const { camera } = usePlayerState();
  const { heldItem } = useItems();
  const { interact, grab, drop, crouch } = useMobileControls();
  const joystickRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const joystickTouch = useRef<TouchPosition | null>(null);
  const cameraTouch = useRef<TouchPosition | null>(null);
  const lastCameraRotation = useRef({ x: 0, y: 0 });

  // Detect mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1024;
      setIsMobile(isTouchDevice && isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle joystick and camera rotation
  useEffect(() => {
    if (!isMobile || disabled || !camera) return;

    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const x = touch.clientX;
        const y = touch.clientY;

        // Left side - joystick
        if (x < window.innerWidth / 2 && !joystickTouch.current) {
          joystickTouch.current = { x, y, id: touch.identifier };
          setJoystickActive(true);
          
          if (joystickRef.current) {
            joystickRef.current.style.left = `${x}px`;
            joystickRef.current.style.top = `${y}px`;
            joystickRef.current.style.opacity = '0.8';
          }
        }
        // Right side - camera control
        else if (x >= window.innerWidth / 2 && !cameraTouch.current) {
          cameraTouch.current = { x, y, id: touch.identifier };
          lastCameraRotation.current = {
            x: camera.rotation.x,
            y: camera.rotation.y,
          };
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // Handle joystick movement
        if (joystickTouch.current && touch.identifier === joystickTouch.current.id) {
          const deltaX = touch.clientX - joystickTouch.current.x;
          const deltaY = touch.clientY - joystickTouch.current.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const maxDistance = 50;
          const clampedDistance = Math.min(distance, maxDistance);
          const angle = Math.atan2(deltaY, deltaX);

          // Update thumb position
          if (thumbRef.current) {
            const thumbX = Math.cos(angle) * clampedDistance;
            const thumbY = Math.sin(angle) * clampedDistance;
            thumbRef.current.style.transform = `translate(${thumbX}px, ${thumbY}px)`;
          }

          // Update movement state
          const threshold = 10;
          if (distance > threshold) {
            const normalizedX = deltaX / distance;
            const normalizedY = deltaY / distance;

            mobileMovement.forward = normalizedY < -0.5;
            mobileMovement.backward = normalizedY > 0.5;
            mobileMovement.left = normalizedX < -0.5;
            mobileMovement.right = normalizedX > 0.5;
          } else {
            mobileMovement.forward = false;
            mobileMovement.backward = false;
            mobileMovement.left = false;
            mobileMovement.right = false;
          }
        }

        // Handle camera rotation
        if (cameraTouch.current && touch.identifier === cameraTouch.current.id) {
          const deltaX = touch.clientX - cameraTouch.current.x;
          const deltaY = touch.clientY - cameraTouch.current.y;

          const sensitivity = 0.002;
          const newRotationY = lastCameraRotation.current.y - deltaX * sensitivity;
          const newRotationX = lastCameraRotation.current.x - deltaY * sensitivity;

          // Clamp vertical rotation
          const maxVerticalRotation = Math.PI / 2 - 0.1;
          const clampedRotationX = Math.max(
            -maxVerticalRotation,
            Math.min(maxVerticalRotation, newRotationX)
          );

          camera.rotation.order = 'YXZ';
          camera.rotation.y = newRotationY;
          camera.rotation.x = clampedRotationX;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // Handle joystick release
        if (joystickTouch.current && touch.identifier === joystickTouch.current.id) {
          joystickTouch.current = null;
          setJoystickActive(false);
          
          if (joystickRef.current) {
            joystickRef.current.style.opacity = '0';
          }
          if (thumbRef.current) {
            thumbRef.current.style.transform = 'translate(0, 0)';
          }

          mobileMovement.forward = false;
          mobileMovement.backward = false;
          mobileMovement.left = false;
          mobileMovement.right = false;
        }

        // Handle camera touch release
        if (cameraTouch.current && touch.identifier === cameraTouch.current.id) {
          cameraTouch.current = null;
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, disabled, camera]);

  if (!isMobile) return null;

  return (
    <>
      {/* Virtual Joystick */}
      <div
        ref={joystickRef}
        style={{
          position: 'fixed',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 2000,
          opacity: joystickActive ? '0.8' : '0',
          transition: 'opacity 0.2s',
        }}
      >
        <div
          ref={thumbRef}
          style={{
            position: 'absolute',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'transform 0.1s',
          }}
        />
      </div>

      {/* Action Buttons */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 2000,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        {/* Interact Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            interact();
          }}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(0, 200, 0, 0.7)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            cursor: 'pointer',
            touchAction: 'none',
          }}
        >
          E<br/>
          <span style={{ fontSize: '10px' }}>Interact</span>
        </button>

        {/* Grab Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            grab();
          }}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(0, 100, 200, 0.7)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            cursor: 'pointer',
            touchAction: 'none',
          }}
        >
          F<br/>
          <span style={{ fontSize: '10px' }}>Grab</span>
        </button>

        {/* Drop Button - only show when holding item */}
        {heldItem && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              drop();
            }}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              border: '3px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(200, 100, 0, 0.7)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              cursor: 'pointer',
              touchAction: 'none',
            }}
          >
            Space<br/>
            <span style={{ fontSize: '10px' }}>Drop</span>
          </button>
        )}

        {/* Crouch Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            crouch();
          }}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(150, 0, 150, 0.7)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            cursor: 'pointer',
            touchAction: 'none',
          }}
        >
          C<br/>
          <span style={{ fontSize: '10px' }}>Crouch</span>
        </button>
      </div>

      {/* Touch instruction overlay (left side) */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '10px',
          borderRadius: '8px',
          pointerEvents: 'none',
          zIndex: 1900,
          maxWidth: '150px',
        }}
      >
        <div>👆 Touch left to move</div>
        <div>👆 Drag right to look</div>
      </div>
    </>
  );
}
