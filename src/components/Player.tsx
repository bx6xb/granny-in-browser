import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RapierRigidBody } from '@react-three/rapier';
import { usePlayerState } from '../store/usePlayerState';
import { useDoors } from '../store/useDoors';
import { useDrawers } from '../store/useDrawers';
import { useItems } from '../store/useItems';
import { useGuillotine } from '../store/useGuillotine';
import { usePlank } from '../store/usePlank';
import { useTerminal } from '../store/useTerminal';
import { useEscapeDoor } from '../store/useEscapeDoor';
import { useWires } from '../store/useWires';
import type { SpotLight as ThreeSpotLight } from 'three';

const PLAYER_HEIGHT = 1.7;
const CROUCH_HEIGHT = 0.9; // Adjust this value to fit through holes
const MOVE_SPEED = 5;
const CROUCH_SPEED = 2.5; // Slower movement when crouching
const INTERACTION_DISTANCE = 3; // Distance at which player can interact with doors/drawers

export function Player() {
  const playerRef = useRef<RapierRigidBody>(null);
  const controlsRef = useRef(null);
  const flashlightRef = useRef<ThreeSpotLight>(null);
  const { camera, scene } = useThree();
  const { playerSpawnArray } = usePlayerState();
  const { toggleDoor, setNearbyDoor } = useDoors();
  const { toggleDrawer, setNearbyDrawer } = useDrawers();
  const { setNearbyItem, grabItem, dropItem, heldItem } = useItems();
  const { setNearGuillotine, placeWatermelon } = useGuillotine();
  const { setNearPlank, chipOffPlank, isChippedOff } = usePlank();
  const { setNearTerminal } = useTerminal();
  const { swipeCard, cutWire } = useEscapeDoor();
  const { setNearWire } = useWires();
  const [isCrouching, setIsCrouching] = useState(false);

  // ===== PERFORMANCE: Dedicated array for interactive objects =====
  const interactiveObjects = useRef<THREE.Object3D[]>([]);

  // Build interactive objects list once on mount or when scene updates
  useEffect(() => {
    const buildInteractiveList = () => {
      const interactives: THREE.Object3D[] = [];
      const addedIds = new Set<string>(); // Prevent duplicates
      
      scene.traverse((obj) => {
        // Check for doors
        if (obj.userData?.isDoor && obj.userData?.doorId) {
          const id = `door_${obj.userData.doorId}`;
          if (!addedIds.has(id)) {
            // Add the parent RigidBody or Group that contains the mesh
            let target = obj;
            // Find the highest parent with the same doorId
            while (target.parent && target.parent.userData?.doorId === obj.userData.doorId) {
              target = target.parent;
            }
            interactives.push(target);
            addedIds.add(id);
            // Enable Layer 1 on this object and all children
            target.traverse((child) => child.layers.enable(1));
          }
        }
        
        // Check for drawers
        if (obj.userData?.isDrawer && obj.userData?.drawerId) {
          const id = `drawer_${obj.userData.drawerId}`;
          if (!addedIds.has(id)) {
            let target = obj;
            // Find the highest parent with the same drawerId
            while (target.parent && target.parent.userData?.drawerId === obj.userData.drawerId) {
              target = target.parent;
            }
            interactives.push(target);
            addedIds.add(id);
            target.traverse((child) => child.layers.enable(1));
          }
        }
        
        // Check for nightstand boxes
        if (obj.name && obj.name.includes('nightstand_box')) {
          if (!addedIds.has(obj.name)) {
            interactives.push(obj);
            addedIds.add(obj.name);
            obj.traverse((child) => child.layers.enable(1));
          }
        }
        
        // Check for items
        if (obj.name === 'padlock_key' || obj.name === 'master_key' || 
            obj.name === 'card' || obj.name === 'safe_key' || 
            obj.name === 'handle' || obj.name === 'watermelon' || 
            obj.name === 'cut' || obj.name === 'hammer' || obj.name === 'wood_plank_item') {
          if (!addedIds.has(obj.name)) {
            interactives.push(obj);
            addedIds.add(obj.name);
            // Enable Layer 1 on this object and all its children (meshes)
            obj.traverse((child) => child.layers.enable(1));
          }
        }
        
        // Check for guillotine
        if (obj.name === 'Cube091') {
          if (!addedIds.has('guillotine')) {
            interactives.push(obj);
            addedIds.add('guillotine');
            obj.layers.enable(1);
          }
        }
        
        // Check for wood plank on door (before chipped off)
        if (obj.name === 'wood_plank') {
          if (!addedIds.has('wood_plank')) {
            interactives.push(obj);
            addedIds.add('wood_plank');
            obj.layers.enable(1);
          }
        }
        
        // Check for terminal
        if (obj.name === 'terminal') {
          if (!addedIds.has('terminal')) {
            interactives.push(obj);
            addedIds.add('terminal');
            obj.layers.enable(1);
          }
        }
        
        // Check for wires
        if (obj.name === 'door_wire' || obj.name === 'shield_wire' || 
            obj.name === 'shield_wire002' || obj.name === 'shield_wire003') {
          if (!addedIds.has(obj.name)) {
            interactives.push(obj);
            addedIds.add(obj.name);
            obj.layers.enable(1);
          }
        }
      });
      
      interactiveObjects.current = interactives;
      console.log(`Built interactive objects list: ${interactives.length} objects`);
    };

    buildInteractiveList();
    
    // Rebuild if scene changes (e.g., items spawned/removed)
    const rebuildTimeout = setInterval(buildInteractiveList, 1000); // Rebuild every second to catch new items
    return () => clearInterval(rebuildTimeout);
  }, [scene]);

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
    const initialRotation = -Math.PI / 2; // 90 degrees to the right
    camera.rotation.set(camera.rotation.x, initialRotation, camera.rotation.z);
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
          // Check if holding cut pliers and near wire
          const nearWire = useWires.getState().nearWire;
          const currentHeldItem = useItems.getState().heldItem;
          const wiresState = useWires.getState();
          
          if (nearWire && currentHeldItem === 'cut') {
            // Check if wire is not already cut
            if (nearWire === 'door_wire' && !wiresState.doorWireCut) {
              useWires.getState().cutWire('door_wire');
              cutWire();
              break;
            } else if (nearWire.startsWith('shield_wire') && !wiresState.shieldWireCut) {
              useWires.getState().cutWire(nearWire);
              cutWire();
              break;
            }
          }
          
          // Check if holding hammer and near plank
          const nearPlank = usePlank.getState().nearPlank;
          const plankChipped = usePlank.getState().isChippedOff;
          
          if (nearPlank && currentHeldItem === 'hammer' && !plankChipped) {
            // Chip off the plank
            chipOffPlank();
            break;
          }
          
          // Check if holding card and near terminal
          const nearTerminal = useTerminal.getState().nearTerminal;
          const cardSwiped = useEscapeDoor.getState().cardSwiped;
          
          if (nearTerminal && currentHeldItem === 'card' && !cardSwiped) {
            // Swipe card in terminal
            swipeCard();
            break;
          }
          
          // Check if holding watermelon and near guillotine
          const nearGuillotine = useGuillotine.getState().nearGuillotine;
          
          if (nearGuillotine && currentHeldItem === 'watermelon') {
            // Place watermelon in guillotine
            placeWatermelon();
            // Remove watermelon from inventory
            useItems.getState().dropItem([0, 0, 0]); // Dummy position, won't be used
            break;
          }
          
          // Interact with nearby door or drawer
          const nearbyDoorId = useDoors.getState().nearbyDoor;
          const nearbyDrawerId = useDrawers.getState().nearbyDrawer;
          if (nearbyDoorId) {
            toggleDoor(nearbyDoorId);
          } else if (nearbyDrawerId) {
            toggleDrawer(nearbyDrawerId);
          }
          break;
        }
        case 'KeyF': {
          // Grab nearby item
          const nearbyItemName = useItems.getState().nearbyItem;
          const currentHeldItem = useItems.getState().heldItem;
          if (nearbyItemName) {
            // If holding an item, drop it first at player position
            if (currentHeldItem && playerRef.current) {
              const pos = playerRef.current.translation();
              dropItem([pos.x, pos.y - 0.5, pos.z]);
            }
            grabItem(nearbyItemName);
          }
          break;
        }
        case 'Space': {
          // Drop held item at player position
          if (useItems.getState().heldItem && playerRef.current) {
            const pos = playerRef.current.translation();
            // Drop in front of player, slightly below eye level
            dropItem([pos.x, pos.y - 0.5, pos.z]);
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
  }, [toggleDoor, toggleDrawer, grabItem, dropItem, placeWatermelon, chipOffPlank, swipeCard, cutWire]);

  // Track previous crouch state to detect transitions
  const prevCrouchState = useRef(false);
  // Track if player is forced to crouch due to ceiling
  const forcedCrouch = useRef(false);

  // ===== PERFORMANCE OPTIMIZATION: Reuse objects instead of creating new ones every frame =====
  // Raycasters (reused every frame)
  const ceilingRaycaster = useRef(new THREE.Raycaster());
  const interactionRaycaster = useRef(new THREE.Raycaster());
  
  // Reusable Vector3 objects
  const upDirection = useRef(new THREE.Vector3(0, 1, 0));
  const rayOrigin = useRef(new THREE.Vector3());
  const cameraDirection = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const moveDirection = useRef(new THREE.Vector3());
  const flashlightOffset = useRef(new THREE.Vector3());
  const lookDirection = useRef(new THREE.Vector3());
  const guillotinePosition = useRef(new THREE.Vector3(-10.7, -1.6, -28.6));
  
  // Item names as Set for O(1) lookup instead of O(n) array.includes()
  const itemNamesSet = useRef(new Set(['padlock_key', 'master_key', 'card', 'safe_key', 'handle', 'watermelon', 'cut', 'hammer', 'wood_plank_item']));
  
  const neededClearance = PLAYER_HEIGHT - CROUCH_HEIGHT + 0.2;

  // ===== STATE GUARDING: Track last IDs to prevent unnecessary React updates =====
  const lastNearbyDoor = useRef<string | null>(null);
  const lastNearbyDrawer = useRef<string | null>(null);
  const lastNearbyItem = useRef<string | null>(null);
  const lastNearGuillotine = useRef<boolean>(false);
  const lastNearPlank = useRef<boolean>(false);
  const lastNearTerminal = useRef<boolean>(false);
  const lastNearWire = useRef<string | null>(null);

  // Configure raycaster to only check layer 1 (interactive objects)
  useEffect(() => {
    interactionRaycaster.current.layers.set(1);
    ceilingRaycaster.current.layers.set(0); // Default layer for ceiling/walls
    
    // Enable Layer 1 on camera so it can render interactive objects
    camera.layers.enable(1);
  }, [camera]);

  // Update player movement and camera
  useFrame(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;
    const velocity = player.linvel();
    const playerPosition = player.translation();

    // ===== OPTIMIZED CEILING CHECK (only when trying to stand up) =====
    // Only check ceiling if player is crouched and NOT pressing crouch key (trying to stand)
    if (!movement.current.crouch && (isCrouching || forcedCrouch.current)) {
      // Reuse rayOrigin vector
      rayOrigin.current.set(
        playerPosition.x,
        playerPosition.y + CROUCH_HEIGHT / 2,
        playerPosition.z
      );

      ceilingRaycaster.current.set(rayOrigin.current, upDirection.current);
      const ceilingIntersects = ceilingRaycaster.current.intersectObjects(scene.children, true);

      let hasClearance = true;
      for (let i = 0; i < ceilingIntersects.length; i++) {
        if (ceilingIntersects[i].distance < neededClearance) {
          hasClearance = false;
          break;
        }
      }

      // If player wants to stand up but there's no clearance, force crouch
      if (!hasClearance) {
        forcedCrouch.current = true;
      } else {
        forcedCrouch.current = false;
      }
    } else if (movement.current.crouch) {
      // Player manually crouching, clear forced crouch
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

    // ===== OPTIMIZED INTERACTION DETECTION (Layer-based, dedicated array) =====
    camera.getWorldDirection(cameraDirection.current);
    interactionRaycaster.current.set(camera.position, cameraDirection.current);

    // Raycast against interactive objects AND their children (recursive: true)
    const intersects = interactionRaycaster.current.intersectObjects(interactiveObjects.current, true);
    let foundDoor: string | null = null;
    let foundDrawer: string | null = null;
    let foundItem: string | null = null;
    let foundGuillotine = false;
    let foundPlank = false;
    let foundTerminal = false;
    let foundWire: string | null = null;

    for (let i = 0; i < intersects.length; i++) {
      const intersect = intersects[i];
      if (intersect.distance <= INTERACTION_DISTANCE) {
        // Check if object or its parent has door or drawer data
        let obj: THREE.Object3D | null = intersect.object;
        while (obj) {
          if (obj.userData?.isDoor && obj.userData?.doorId) {
            foundDoor = obj.userData.doorId;
            break;
          }
          if (obj.userData?.isDrawer && obj.userData?.drawerId) {
            foundDrawer = obj.userData.drawerId;
            break;
          }
          if (obj.name && obj.name.includes('nightstand_box')) {
            foundDrawer = obj.name;
            break;
          }
          // Check for wood plank on door - only if holding hammer and not chipped off yet
          if (heldItem === 'hammer' && !isChippedOff && obj.name === 'wood_plank') {
            foundPlank = true;
            break;
          }
          // Check for terminal - only if holding card
          if (heldItem === 'card' && obj.name === 'terminal') {
            foundTerminal = true;
            break;
          }
          // Check for wires - only if holding cut pliers
          if (heldItem === 'cut') {
            const wiresState = useWires.getState();
            if (obj.name === 'door_wire' && !wiresState.doorWireCut) {
              foundWire = 'door_wire';
              break;
            } else if ((obj.name === 'shield_wire' || obj.name === 'shield_wire002' || 
                       obj.name === 'shield_wire003') && !wiresState.shieldWireCut) {
              foundWire = obj.name;
              break;
            }
          }
          // Check for items (using Set for faster lookup)
          if (itemNamesSet.current.has(obj.name)) {
            foundItem = obj.name;
            break;
          }
          // Check for guillotine blade - only if holding watermelon
          if (heldItem === 'watermelon' && obj.name === 'Cube091') {
            // Check if looking at the watermelon placement position
            const distanceToGuillotine = intersect.point.distanceTo(guillotinePosition.current);
            if (distanceToGuillotine < 0.5) { // Within 0.5 units of the placement point
              foundGuillotine = true;
              break;
            }
          }
          obj = obj.parent;
        }
        if (foundDoor || foundDrawer || foundItem || foundGuillotine || foundPlank || foundTerminal || foundWire) break;
      }
    }

    // ===== STATE GUARDING: Only update React state if values changed =====
    if (foundDoor !== lastNearbyDoor.current) {
      setNearbyDoor(foundDoor);
      lastNearbyDoor.current = foundDoor;
    }
    
    if (foundDrawer !== lastNearbyDrawer.current) {
      setNearbyDrawer(foundDrawer);
      lastNearbyDrawer.current = foundDrawer;
    }
    
    if (foundItem !== lastNearbyItem.current) {
      setNearbyItem(foundItem);
      lastNearbyItem.current = foundItem;
    }
    
    if (foundGuillotine !== lastNearGuillotine.current) {
      setNearGuillotine(foundGuillotine);
      lastNearGuillotine.current = foundGuillotine;
    }
    
    if (foundPlank !== lastNearPlank.current) {
      setNearPlank(foundPlank);
      lastNearPlank.current = foundPlank;
    }
    
    if (foundTerminal !== lastNearTerminal.current) {
      setNearTerminal(foundTerminal);
      lastNearTerminal.current = foundTerminal;
    }
    
    if (foundWire !== lastNearWire.current) {
      setNearWire(foundWire);
      lastNearWire.current = foundWire;
    }

    // Adjust Y position when transitioning between crouch states to keep feet on ground
    if (isActuallyCrouching !== prevCrouchState.current) {
      const heightDifference = (PLAYER_HEIGHT - CROUCH_HEIGHT) / 2;

      if (isActuallyCrouching) {
        // Crouching: lower the player position
        player.setTranslation(
          {
            x: playerPosition.x,
            y: playerPosition.y - heightDifference,
            z: playerPosition.z,
          },
          true
        );
      } else {
        // Standing up: raise the player position
        player.setTranslation(
          {
            x: playerPosition.x,
            y: playerPosition.y + heightDifference,
            z: playerPosition.z,
          },
          true
        );
      }

      prevCrouchState.current = isActuallyCrouching;
    }

    // ===== OPTIMIZED MOVEMENT CALCULATION (reusing vectors) =====
    camera.getWorldDirection(direction.current);
    direction.current.y = 0;
    direction.current.normalize();

    right.current.crossVectors(camera.up, direction.current).normalize();

    // Reset moveDirection
    moveDirection.current.set(0, 0, 0);

    if (movement.current.forward) {
      moveDirection.current.add(direction.current);
    }
    if (movement.current.backward) {
      moveDirection.current.sub(direction.current);
    }
    if (movement.current.left) {
      moveDirection.current.add(right.current);
    }
    if (movement.current.right) {
      moveDirection.current.sub(right.current);
    }

    const moveLength = moveDirection.current.length();
    if (moveLength > 0) {
      moveDirection.current.normalize();
      moveDirection.current.multiplyScalar(currentSpeed);
    }

    // Apply horizontal movement (with instant stop when no input)
    player.setLinvel(
      {
        x: moveDirection.current.x,
        y: velocity.y,
        z: moveDirection.current.z,
      },
      true
    );

    // Apply gentle downward force ONLY when moving and going downward to prevent ramp flying
    if (moveLength > 0 && velocity.y < -0.1) {
      player.applyImpulse({ x: 0, y: -0.2, z: 0 }, true);
    }

    // Update camera position based on crouch state
    camera.position.set(
      playerPosition.x,
      playerPosition.y + currentHeight,
      playerPosition.z
    );

    // ===== OPTIMIZED FLASHLIGHT UPDATE (reusing vectors) =====
    if (flashlightRef.current) {
      const flashlight = flashlightRef.current;

      // Position flashlight at camera position (slightly offset down and forward)
      flashlightOffset.current.set(0, -0.2, 0);
      flashlightOffset.current.applyQuaternion(camera.quaternion);
      flashlight.position.copy(camera.position).add(flashlightOffset.current);

      // Point flashlight in the direction camera is looking
      camera.getWorldDirection(lookDirection.current);

      // Set target position ahead of the flashlight in look direction
      flashlight.target.position.copy(flashlight.position).add(lookDirection.current.multiplyScalar(5));
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
        collisionGroups={(0x0001 << 16) | 0x0002} // Player in group 1, only collides with group 0 (static)
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
