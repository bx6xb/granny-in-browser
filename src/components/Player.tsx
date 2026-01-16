import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RapierRigidBody } from '@react-three/rapier';
import { usePlayerState } from '../store/usePlayerState';
import { useDoors } from '../store/useDoors';

const PLAYER_HEIGHT = 1.7;
const CROUCH_HEIGHT = 0.9; // Adjust this value to fit through holes
const MOVE_SPEED = 5;
const CROUCH_SPEED = 2.5; // Slower movement when crouching
const INTERACTION_DISTANCE = 3; // Distance at which player can interact with doors

export function Player() {
  const playerRef = useRef<RapierRigidBody>(null);
  const controlsRef = useRef(null);
  const { camera, scene } = useThree();
  const { playerSpawnArray } = usePlayerState();
  const { toggleDoor, setNearbyDoor } = useDoors();
  const [isCrouching, setIsCrouching] = useState(false);

  // Movement state
  const movement = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    crouch: false,
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          movement.current.forward = true;
          break;
        case 'KeyS':
          movement.current.backward = true;
          break;
        case 'KeyA':
          movement.current.left = true;
          break;
        case 'KeyD':
          movement.current.right = true;
          break;
        case 'KeyC':
          movement.current.crouch = true;
          setIsCrouching(true);
          break;
        case 'KeyE': {
          // Interact with nearby door
          const nearbyDoorId = useDoors.getState().nearbyDoor;
          if (nearbyDoorId) {
            toggleDoor(nearbyDoorId);
          }
          break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          movement.current.forward = false;
          break;
        case 'KeyS':
          movement.current.backward = false;
          break;
        case 'KeyA':
          movement.current.left = false;
          break;
        case 'KeyD':
          movement.current.right = false;
          break;
        case 'KeyC':
          movement.current.crouch = false;
          setIsCrouching(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [toggleDoor]);

  // Track previous crouch state to detect transitions
  const prevCrouchState = useRef(false);

  // Update player movement and camera
  useFrame(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;
    const velocity = player.linvel();

    // Determine current height based on crouch state
    const currentHeight = movement.current.crouch ? CROUCH_HEIGHT : PLAYER_HEIGHT;
    const currentSpeed = movement.current.crouch ? CROUCH_SPEED : MOVE_SPEED;

    // Detect nearby doors using raycasting
    const playerPosition = player.translation();
    const raycaster = new THREE.Raycaster();
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    raycaster.set(
      new THREE.Vector3(playerPosition.x, playerPosition.y + currentHeight / 2, playerPosition.z),
      cameraDirection
    );

    // Check for doors within interaction distance
    const intersects = raycaster.intersectObjects(scene.children, true);
    let foundDoor = false;

    for (const intersect of intersects) {
      if (intersect.distance <= INTERACTION_DISTANCE) {
        // Check if object or its parent has door data
        let obj: THREE.Object3D | null = intersect.object;
        while (obj) {
          if (obj.userData?.isDoor && obj.userData?.doorId) {
            setNearbyDoor(obj.userData.doorId);
            foundDoor = true;
            break;
          }
          obj = obj.parent;
        }
        if (foundDoor) break;
      }
    }

    if (!foundDoor) {
      setNearbyDoor(null);
    }

    // Adjust Y position when transitioning between crouch states to keep feet on ground
    if (movement.current.crouch !== prevCrouchState.current) {
      const crouchPlayerPosition = player.translation();
      const heightDifference = (PLAYER_HEIGHT - CROUCH_HEIGHT) / 2;

      if (movement.current.crouch) {
        // Crouching: lower the player position
        player.setTranslation(
          {
            x: crouchPlayerPosition.x,
            y: crouchPlayerPosition.y - heightDifference,
            z: crouchPlayerPosition.z,
          },
          true
        );
      } else {
        // Standing up: raise the player position
        player.setTranslation(
          {
            x: crouchPlayerPosition.x,
            y: crouchPlayerPosition.y + heightDifference,
            z: crouchPlayerPosition.z,
          },
          true
        );
      }

      prevCrouchState.current = movement.current.crouch;
    }

    // Get camera direction
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();

    // Calculate movement
    const moveDirection = new THREE.Vector3();

    if (movement.current.forward) {
      moveDirection.add(direction);
    }
    if (movement.current.backward) {
      moveDirection.sub(direction);
    }
    if (movement.current.left) {
      moveDirection.add(right);
    }
    if (movement.current.right) {
      moveDirection.sub(right);
    }

    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      moveDirection.multiplyScalar(currentSpeed);
    }

    // Apply horizontal movement
    player.setLinvel(
      {
        x: moveDirection.x,
        y: velocity.y,
        z: moveDirection.z,
      },
      true
    );

    // Update camera position based on crouch state
    const cameraPlayerPosition = player.translation();
    camera.position.set(
      cameraPlayerPosition.x,
      cameraPlayerPosition.y + currentHeight,
      cameraPlayerPosition.z
    );
  });

  // Get spawn position
  const spawnPosition: [number, number, number] = playerSpawnArray || [0, 2, 0];

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      <RigidBody
        ref={playerRef}
        position={spawnPosition}
        enabledRotations={[false, false, false]}
        lockRotations
        colliders={false}
        mass={80}
      >
        {/* Capsule collider with dynamic height based on crouch state */}
        <CapsuleCollider args={[(isCrouching ? CROUCH_HEIGHT : PLAYER_HEIGHT) / 2, 0.3]} />
      </RigidBody>
    </>
  );
}
