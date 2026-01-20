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
  children?: React.ReactNode; // Optional additional meshes (e.g., handles)
}

export function Door({
  doorId,
  geometry,
  material,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  openDirection = 1,
  children,
}: DoorProps) {
  const doorRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { initializeDoor, getDoorState, setDoorRotating, updateDoorRotation } = useDoors();

  // Subscribe to door state changes
  const doorState = useDoors((state) => state.doors.get(doorId));

  // Initialize door on mount
  useEffect(() => {
    initializeDoor(doorId, openDirection);
  }, [doorId, openDirection, initializeDoor]);

  // Sync visual rotation when state changes (especially when doors are reset)
  useEffect(() => {
    const targetRef = groupRef.current || meshRef.current;
    if (!doorState || !targetRef) return;

    // If door is not rotating, immediately sync visual rotation to current state
    if (!doorState.isRotating) {
      targetRef.rotation.y = rotation[1] + doorState.currentRotation;
    }
  }, [doorState, rotation]);

  // Animate door rotation
  useFrame(() => {
    const currentDoorState = getDoorState(doorId);
    const targetRef = groupRef.current || meshRef.current;
    if (!currentDoorState || !targetRef) return;

    if (currentDoorState.isRotating) {
      const rotationSpeed = 0.15; // Adjust for smoother/faster animation
      const diff = currentDoorState.targetRotation - currentDoorState.currentRotation;

      if (Math.abs(diff) > 0.05) {
        // Smoothly interpolate towards target
        const newRotation = currentDoorState.currentRotation + diff * rotationSpeed;
        updateDoorRotation(doorId, newRotation);
        
        // Update rotation (group or mesh)
        targetRef.rotation.y = rotation[1] + newRotation;
      } else {
        // Snap to target and stop rotating
        updateDoorRotation(doorId, currentDoorState.targetRotation);
        targetRef.rotation.y = rotation[1] + currentDoorState.targetRotation;
        setDoorRotating(doorId, false);
      }
    }
  });

  const isRotating = doorState?.isRotating || false;

  // Set userData on mesh ref when it's ready
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.isDoor = true;
      meshRef.current.userData.doorId = doorId;
    }
    if (groupRef.current) {
      groupRef.current.userData.isDoor = true;
      groupRef.current.userData.doorId = doorId;
      // Also traverse all children
      groupRef.current.traverse((child) => {
        child.userData.isDoor = true;
        child.userData.doorId = doorId;
      });
    }
  }, [doorId]);

  // If children are provided, wrap in a group; otherwise render mesh directly
  if (children) {
    return (
      <RigidBody
        ref={doorRef}
        type="fixed"
        colliders={isRotating ? false : 'trimesh'} // Disable collision while rotating
        position={position}
        userData={{ isDoor: true, doorId }}
      >
        <group ref={groupRef} rotation={rotation} scale={scale}>
          <mesh
            ref={meshRef}
            geometry={geometry}
            material={material}
          />
          {children}
        </group>
      </RigidBody>
    );
  }

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
