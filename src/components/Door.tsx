import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useDoors } from '../store/useDoors';

interface DoorProps {
  doorId: string;
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  openDirection?: 1 | -1; // 1 for clockwise (default), -1 for counter-clockwise
}

export function Door({
  doorId,
  geometry,
  material,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  openDirection = 1,
}: DoorProps) {
  const doorRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { initializeDoor, getDoorState, setDoorRotating, updateDoorRotation } = useDoors();

  // Initialize door on mount
  useEffect(() => {
    initializeDoor(doorId, openDirection);
  }, [doorId, openDirection, initializeDoor]);

  // Animate door rotation
  useFrame(() => {
    const doorState = getDoorState(doorId);
    if (!doorState || !meshRef.current) return;

    if (doorState.isRotating) {
      const rotationSpeed = 0.15; // Adjust for smoother/faster animation
      const diff = doorState.targetRotation - doorState.currentRotation;

      if (Math.abs(diff) > 0.05) {
        // Smoothly interpolate towards target
        const newRotation = doorState.currentRotation + diff * rotationSpeed;
        updateDoorRotation(doorId, newRotation);
        
        // Update mesh rotation
        meshRef.current.rotation.y = rotation[1] + newRotation;
      } else {
        // Snap to target and stop rotating
        updateDoorRotation(doorId, doorState.targetRotation);
        meshRef.current.rotation.y = rotation[1] + doorState.targetRotation;
        setDoorRotating(doorId, false);
      }
    }
  });

  const doorState = getDoorState(doorId);
  const isRotating = doorState?.isRotating || false;

  return (
    <RigidBody
      ref={doorRef}
      type="fixed"
      colliders={isRotating ? false : 'trimesh'} // Disable collision while rotating
      position={position}
      userData={{ isDoor: true, doorId }}
    >
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={rotation}
        scale={scale}
      />
    </RigidBody>
  );
}
