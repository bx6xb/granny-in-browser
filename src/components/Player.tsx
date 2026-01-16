import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RapierRigidBody } from '@react-three/rapier';
import { usePlayerState } from '../store/usePlayerState';
import { useDoors } from '../store/useDoors';
import type { SpotLight as ThreeSpotLight } from 'three';

const PLAYER_HEIGHT = 1.7;
const CROUCH_HEIGHT = 0.9; // Adjust this value to fit through holes
const MOVE_SPEED = 5;
const CROUCH_SPEED = 2.5; // Slower movement when crouching
const INTERACTION_DISTANCE = 3; // Distance at which player can interact with doors

export function Player() {
  const playerRef = useRef<RapierRigidBody>(null);
  const controlsRef = useRef(null);
  const flashlightRef = useRef<ThreeSpotLight>(null);
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

  // Set initial camera rotation (90 degrees to the right)
  useEffect(() => {
    camera.rotation.y = -Math.PI / 2; // 90 degrees to the right
  }, [camera]);

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
  // Track if player is forced to crouch due to ceiling
  const forcedCrouch = useRef(false);

  // Update player movement and camera
  useFrame(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;
    const velocity = player.linvel();

    // Check for ceiling clearance before allowing stand up
    const playerPosition = player.translation();
    const ceilingRaycaster = new THREE.Raycaster();
    const upDirection = new THREE.Vector3(0, 1, 0);
    
    // Cast ray upward from player position to check for obstacles
    const rayOrigin = new THREE.Vector3(
      playerPosition.x, 
      playerPosition.y + CROUCH_HEIGHT / 2, 
      playerPosition.z
    );
    
    ceilingRaycaster.set(rayOrigin, upDirection);
    const ceilingIntersects = ceilingRaycaster.intersectObjects(scene.children, true);
    
    // Calculate needed clearance (difference between standing and crouching height + small buffer)
    const neededClearance = (PLAYER_HEIGHT - CROUCH_HEIGHT) + 0.2;
    let hasClearance = true;
    
    for (const intersect of ceilingIntersects) {
      if (intersect.distance < neededClearance) {
        hasClearance = false;
        break;
      }
    }
    
    // If player wants to stand up but there's no clearance, force crouch
    if (!movement.current.crouch && !hasClearance) {
      forcedCrouch.current = true;
    } else if (hasClearance) {
      forcedCrouch.current = false;
    }
    
    // Determine actual crouch state (either manual or forced)
    const isActuallyCrouching = movement.current.crouch || forcedCrouch.current;
    
    // Update visual crouch state for collider
    if (isCrouching !== isActuallyCrouching) {
      setIsCrouching(isActuallyCrouching);
    }

    // Determine current height based on actual crouch state
    const currentHeight = isActuallyCrouching ? CROUCH_HEIGHT : PLAYER_HEIGHT;
    let currentSpeed = isActuallyCrouching ? CROUCH_SPEED : MOVE_SPEED;

    // Boost speed when climbing (going up) to maintain consistent feel
    if (velocity.y > 0.1) {
      currentSpeed *= 1.4; // 40% boost when going uphill
    }

    // Detect nearby doors using raycasting
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
    if (isActuallyCrouching !== prevCrouchState.current) {
      const crouchPlayerPosition = player.translation();
      const heightDifference = (PLAYER_HEIGHT - CROUCH_HEIGHT) / 2;

      if (isActuallyCrouching) {
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

      prevCrouchState.current = isActuallyCrouching;
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

    // Apply horizontal movement (with instant stop when no input)
    player.setLinvel(
      {
        x: moveDirection.x,
        y: velocity.y,
        z: moveDirection.z,
      },
      true
    );

    // Apply gentle downward force ONLY when moving and going downward to prevent ramp flying
    if (moveDirection.length() > 0 && velocity.y < -0.1) {
      player.applyImpulse({ x: 0, y: -0.2, z: 0 }, true);
    }

    // Update camera position based on crouch state
    const cameraPlayerPosition = player.translation();
    camera.position.set(
      cameraPlayerPosition.x,
      cameraPlayerPosition.y + currentHeight,
      cameraPlayerPosition.z
    );

    // Update flashlight to follow camera direction
    if (flashlightRef.current) {
      const flashlight = flashlightRef.current;

      // Position flashlight at camera position (slightly offset down and forward)
      const flashlightOffset = new THREE.Vector3(0, -0.2, 0);
      flashlightOffset.applyQuaternion(camera.quaternion);
      flashlight.position.copy(camera.position).add(flashlightOffset);

      // Point flashlight in the direction camera is looking
      const lookDirection = new THREE.Vector3();
      camera.getWorldDirection(lookDirection);

      // Set target position ahead of the flashlight in look direction
      flashlight.target.position.copy(flashlight.position).add(lookDirection.multiplyScalar(5));
      flashlight.target.updateMatrixWorld();
    }
  });

  // Get spawn position
  const spawnPosition: [number, number, number] = playerSpawnArray || [0, 2, 0];

  return (
    <>
      <PointerLockControls ref={controlsRef} />

      {/* Player flashlight - optimized spotlight that follows camera direction */}
      <spotLight
        ref={flashlightRef}
        intensity={50}
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={20}
        decay={2}
        castShadow={false} // Disabled for performance
        color="#fff5e6"
      />

      <RigidBody
        ref={playerRef}
        position={spawnPosition}
        enabledRotations={[false, false, false]}
        lockRotations
        colliders={false}
        mass={80}
        linearDamping={5} // Moderate damping for quick stop without killing speed
      >
        {/* Capsule collider with dynamic height based on crouch state */}
        <CapsuleCollider
          args={[(isCrouching ? CROUCH_HEIGHT : PLAYER_HEIGHT) / 2, 0.3]}
          friction={1.5} // Good grip without too much resistance
          restitution={0} // No bounciness
        />
      </RigidBody>
    </>
  );
}
