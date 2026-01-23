import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RapierRigidBody } from '@react-three/rapier';
import { usePlayerState } from '../store/usePlayerState';
import { useDoors } from '../store/useDoors';
import { useItems } from '../store/useItems';
import { useGuillotine } from '../store/useGuillotine';
import { usePlank } from '../store/usePlank';
import { useTerminal } from '../store/useTerminal';
import { useEscapeDoor } from '../store/useEscapeDoor';
import { useWires } from '../store/useWires';
import { useLock } from '../store/useLock';
import { useSafe } from '../store/useSafe';
import { useWell } from '../store/useWell';
import { useGameSettings } from '../store/useGameSettings';
import { useDayState } from '../store/useDayState';
import { useBedHiding } from '../store/useBedHiding';
import { useScreamer } from '../store/useScreamer';
import type { SpotLight as ThreeSpotLight } from 'three';
import { useMobileControls } from '../store/useMobileControls';
import { mobileMovement } from './MobileControls';

const PLAYER_HEIGHT = 1.7;
const CROUCH_HEIGHT = 0.9; // Adjust this value to fit through holes
const MOVE_SPEED = 5;
const CROUCH_SPEED = 2.5; // Slower movement when crouching
const INTERACTION_DISTANCE = 3; // Distance at which player can interact with doors

export function Player() {
  const playerRef = useRef<RapierRigidBody>(null);
  const controlsRef = useRef(null);
  const flashlightRef = useRef<ThreeSpotLight>(null);
  const walkAudioRef = useRef<HTMLAudioElement | null>(null);
  const { camera, scene } = useThree();
  const { playerSpawnArray, shouldResetCamera, clearCameraReset, setCamera } = usePlayerState();
  const { toggleDoor, setNearbyDoor } = useDoors();
  const { setNearbyItem, grabItem, dropItem, heldItem } = useItems();
  const { setNearGuillotine, placeWatermelon } = useGuillotine();
  const { setNearPlank, chipOffPlank, isChippedOff, setNearPlankSlot, placePlank, plankPlaced } = usePlank();
  const { setNearTerminal } = useTerminal();
  const { swipeCard, cutWire, openLock, setNearMainDoor, escape, hasEscaped } = useEscapeDoor();
  const { setNearWire } = useWires();
  const { setNearLock } = useLock();
  const { openSafe } = useSafe();
  const { setNearShaft, setNearHandle, setHandle, startUsingWell, stopUsingWell } = useWell();
  const { inGameMenuOpen, setInGameMenuOpen } = useGameSettings();
  const { nextDay, showDayMessage, gameOver } = useDayState();
  const { setNearBed, hideInBed, standUp, isHiding, originalPosition, bedPosition, shouldRestorePosition, clearRestoreFlag } = useBedHiding();
  const [isCrouching, setIsCrouching] = useState(false);
  const lastPointerLockExit = useRef(0);
  const [canEnablePointerLock, setCanEnablePointerLock] = useState(true);
  const [isDying, setIsDying] = useState(false);
  const { isScreamerActive, grannyPosition } = useScreamer();
  const screamerCameraLocked = useRef(false);

  // Initialize walk audio
  useEffect(() => {
    const audio = new Audio('/sounds/walk.mp3');
    audio.loop = true;
    const initialVolume = useGameSettings.getState().volume;
    audio.volume = (initialVolume / 100) * 0.3;
    walkAudioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);
  
  // Update walk audio volume when settings change
  const { volume } = useGameSettings();
  useEffect(() => {
    if (walkAudioRef.current) {
      walkAudioRef.current.volume = (volume / 100) * 0.3;
    }
  }, [volume]);

  // Exit pointer lock when player escapes or menu opens or game over
  useEffect(() => {
    if ((hasEscaped || inGameMenuOpen || gameOver) && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [hasEscaped, inGameMenuOpen, gameOver]);

  // Handle pointer lock errors and state changes
  useEffect(() => {
    const handlePointerLockError = (e: Event) => {
      // Silently handle pointer lock errors - they're often timing-related and harmless
      e.preventDefault();
      e.stopPropagation();
    };

    const handlePointerLockChange = () => {
      if (!document.pointerLockElement) {
        // Track when pointer lock exits and add cooldown
        lastPointerLockExit.current = Date.now();
        setCanEnablePointerLock(false);
        
        // Re-enable after 300ms cooldown to avoid timing issues
        setTimeout(() => {
          setCanEnablePointerLock(true);
        }, 300);
      }
    };

    // Override default error handling for pointer lock
    const originalErrorHandler = window.onerror;
    window.onerror = (msg, url, line, col, error) => {
      if (typeof msg === 'string' && 
          (msg.includes('PointerLockControls') || 
           msg.includes('Pointer Lock API') ||
           (error && error.name === 'SecurityError' && error.message?.includes('lock')))) {
        // Suppress pointer lock errors
        return true;
      }
      return originalErrorHandler ? originalErrorHandler(msg, url, line, col, error) : false;
    };

    document.addEventListener('pointerlockerror', handlePointerLockError);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    
    return () => {
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.onerror = originalErrorHandler;
    };
  }, []);

  // Open menu when window loses focus
  useEffect(() => {
    const handleBlur = () => {
      if (!hasEscaped && !inGameMenuOpen) {
        setInGameMenuOpen(true);
      }
    };

    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [hasEscaped, inGameMenuOpen, setInGameMenuOpen]);

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
        
        // Check for items
        if (obj.name === 'padlock_key' || obj.name === 'master_key' || 
            obj.name === 'card' || obj.name === 'safe_key' || 
            obj.name === 'handle' || obj.name === 'watermelon' || 
            obj.name === 'cut' || obj.name === 'hammer' || obj.name === 'wood_plank_item' || 
            obj.name === 'vase') {
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
        
        // Check for wood plank slot (to place plank)
        if (obj.name === 'wood_plank_slot') {
          if (!addedIds.has('wood_plank_slot')) {
            interactives.push(obj);
            addedIds.add('wood_plank_slot');
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
            obj.name === 'shield_wire002' || obj.name === 'shield_wire003' || obj.name === 'attic_wire') {
          if (!addedIds.has(obj.name)) {
            interactives.push(obj);
            addedIds.add(obj.name);
            obj.layers.enable(1);
          }
        }
        
        // Check for door lock
        if (obj.name === 'door_lock') {
          if (!addedIds.has('door_lock')) {
            interactives.push(obj);
            addedIds.add('door_lock');
            obj.traverse((child) => child.layers.enable(1));
          }
        }
        
        // Check for main door (escape door)
        if (obj.name === 'main_door') {
          if (!addedIds.has('main_door')) {
            interactives.push(obj);
            addedIds.add('main_door');
            obj.traverse((child) => child.layers.enable(1));
          }
        }
        
        // Check for well shaft
        if (obj.name === 'shaft001' || obj.name === 'Cylinder024' || obj.name === 'Cylinder024_1') {
          if (!addedIds.has('shaft001')) {
            // Find the parent group
            let target = obj;
            while (target.parent && target.parent.name !== 'shaft001') {
              target = target.parent;
            }
            if (target.parent && target.parent.name === 'shaft001') {
              target = target.parent;
            }
            interactives.push(target);
            addedIds.add('shaft001');
            target.traverse((child) => child.layers.enable(1));
          }
        }
        
        // Check for well handle
        if (obj.name === 'handle001') {
          if (!addedIds.has('handle001')) {
            interactives.push(obj);
            addedIds.add('handle001');
            obj.traverse((child) => child.layers.enable(1));
          }
        }
        
        // Check for beds
        if (obj.name === 'bed001' || obj.name === 'bed002' || obj.name === 'bed003') {
          if (!addedIds.has(obj.name)) {
            interactives.push(obj);
            addedIds.add(obj.name);
            obj.traverse((child) => child.layers.enable(1));
          }
        }
      });
      
      interactiveObjects.current = interactives;
    };

    buildInteractiveList();
    
    // Rebuild if scene changes (e.g., items spawned/removed)
    const rebuildTimeout = setInterval(buildInteractiveList, 1000); // Rebuild every second to catch new items
    return () => clearInterval(rebuildTimeout);
  }, [scene]);

  // Movement state - import from MobileControls for mobile, use ref for keyboard
  const movement = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    crouch: false,
  });

  // Track if C key is pressed to prevent continuous toggling
  const crouchKeyHeld = useRef(false);

  // Set initial camera rotation (90 degrees to the right) and store camera reference
  useEffect(() => {
    const initialRotation = -Math.PI / 2; // 90 degrees to the right
    camera.rotation.set(camera.rotation.x, initialRotation, camera.rotation.z);
    setCamera(camera);
  }, [camera, setCamera]);

  // Apply custom mouse sensitivity
  const { sensitivity } = useGameSettings();
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement && !hasEscaped && !inGameMenuOpen && !gameOver && !isScreamerActive) {
        const sensitivityFactor = sensitivity / 50; // Normalize to 0-2 range (50 = 1.0 = default)
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
        
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(camera.quaternion);
        
        euler.y -= movementX * 0.002 * sensitivityFactor;
        euler.x -= movementY * 0.002 * sensitivityFactor;
        
        // Clamp vertical rotation
        const maxVerticalRotation = Math.PI / 2 - 0.1;
        euler.x = Math.max(-maxVerticalRotation, Math.min(maxVerticalRotation, euler.x));
        
        camera.quaternion.setFromEuler(euler);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove, false);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove, false);
    };
  }, [sensitivity, camera, hasEscaped, inGameMenuOpen, gameOver, isScreamerActive]);

  // Watch for camera reset trigger
  useEffect(() => {
    if (shouldResetCamera) {
      camera.rotation.set(0, -Math.PI / 2, 0);
      clearCameraReset();
    }
  }, [shouldResetCamera, camera, clearCameraReset]);

  // Disable pointer lock controls when escaped or menu is open or game over or screamer is active
  useEffect(() => {
    if ((hasEscaped || inGameMenuOpen || gameOver || isScreamerActive) && controlsRef.current) {
      const controls = controlsRef.current as any;
      if (controls.unlock) {
        controls.unlock();
      }
    }
  }, [hasEscaped, inGameMenuOpen, gameOver, isScreamerActive]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle ESC and ALT to toggle menu (but not during game over or victory)
      if (e.code === 'Escape' || e.code === 'AltLeft' || e.code === 'AltRight') {
        if (!gameOver && !hasEscaped && !isScreamerActive) {
          setInGameMenuOpen(!inGameMenuOpen);
        }
        return;
      }
      
      // Disable all input if player has escaped or menu is open or screamer is active
      if (hasEscaped || inGameMenuOpen || isScreamerActive) return;
      
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
          // Toggle crouch only on first press, not while holding
          if (!crouchKeyHeld.current) {
            movement.current.crouch = !movement.current.crouch;
            setIsCrouching(!isCrouching);
            crouchKeyHeld.current = true;
          }
          break;
        case 'KeyE': {
          const currentHeldItem = useItems.getState().heldItem;
          
          // Check if holding plank and near plank slot
          const nearPlankSlot = usePlank.getState().nearPlankSlot;
          const plankPlaced = usePlank.getState().plankPlaced;
          
          if (nearPlankSlot && currentHeldItem === 'wood_plank_item' && !plankPlaced) {
            // Place plank
            placePlank();
            // Remove plank from inventory
            useItems.getState().dropItem([0, -100, 0]); // Drop at impossible position (will not appear)
            break;
          }
          
          // Check if holding handle and near shaft
          const nearShaft = useWell.getState().nearShaft;
          const handleSet = useWell.getState().handleSet;
          
          if (nearShaft && currentHeldItem === 'handle' && !handleSet) {
            // Set handle on well
            setHandle();
            // Remove handle from inventory
            useItems.getState().dropItem([0, -100, 0]); // Drop at impossible position (will not appear)
            break;
          }
          
          // Check if near main door with master key and all conditions met
          const nearMainDoor = useEscapeDoor.getState().nearMainDoor;
          const isDoorUnlocked = useEscapeDoor.getState().isDoorUnlocked;
          
          if (nearMainDoor && currentHeldItem === 'master_key' && isDoorUnlocked) {
            escape();
            break;
          }
          
          // Check if holding padlock key and near lock
          const nearLock = useLock.getState().nearLock;
          const lockOpened = useEscapeDoor.getState().lockOpened;
          
          if (nearLock && currentHeldItem === 'padlock_key' && !lockOpened) {
            // Open the lock
            openLock();
            break;
          }
          
          // Check if holding cut pliers and near wire
          const nearWire = useWires.getState().nearWire;
          const wiresState = useWires.getState();
          
          if (nearWire && currentHeldItem === 'cut_pliers') {
            // Check if wire is not already cut
            if (nearWire === 'door_wire' && !wiresState.doorWireCut) {
              useWires.getState().cutWire('door_wire');
              cutWire();
              break;
            } else if (nearWire.startsWith('shield_wire') && !wiresState.shieldWireCut) {
              useWires.getState().cutWire(nearWire);
              cutWire();
              break;
            } else if (nearWire === 'attic_wire' && !wiresState.atticWireCut) {
              useWires.getState().cutWire('attic_wire');
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
          
          // Check if near bed for hiding
          const nearBed = useBedHiding.getState().nearBed;
          const isCurrentlyHiding = useBedHiding.getState().isHiding;
          
          if (nearBed && !isCurrentlyHiding && playerRef.current && currentBedObject.current) {
            // Hide under bed - get bed's center position
            const pos = playerRef.current.translation();
            const bedWorldPos = new THREE.Vector3();
            currentBedObject.current.getWorldPosition(bedWorldPos);
            hideInBed(nearBed, [pos.x, pos.y, pos.z], [bedWorldPos.x, bedWorldPos.y, bedWorldPos.z]);
            break;
          } else if (isCurrentlyHiding) {
            // Stand up from bed
            standUp();
            break;
          }
          
          // Interact with nearby door
          const nearbyDoorId = useDoors.getState().nearbyDoor;
          if (nearbyDoorId) {
            // Check if it's the safe door and if player has the safe key
            if (nearbyDoorId === 'safe_door001') {
              const currentHeldItem = useItems.getState().heldItem;
              const safeOpened = useSafe.getState().safeOpened;
              if (currentHeldItem === 'safe_key' && !safeOpened) {
                toggleDoor(nearbyDoorId);
                openSafe();
              }
            } else {
              toggleDoor(nearbyDoorId);
            }
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
      // Disable all input if player has escaped or menu is open or screamer is active
      if (hasEscaped || inGameMenuOpen || isScreamerActive) return;
      
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
          crouchKeyHeld.current = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [toggleDoor, grabItem, dropItem, placeWatermelon, chipOffPlank, swipeCard, cutWire, openLock, escape, hasEscaped, setHandle, placePlank, inGameMenuOpen, setInGameMenuOpen, gameOver, isScreamerActive]);
  
  // Handle continuous key press for well usage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasEscaped || inGameMenuOpen || isScreamerActive) return;
      
      if (e.code === 'KeyE') {
        const nearHandle = useWell.getState().nearHandle;
        const handleSet = useWell.getState().handleSet;
        
        if (nearHandle && handleSet) {
          startUsingWell();
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') {
        stopUsingWell();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hasEscaped, inGameMenuOpen, isScreamerActive, startUsingWell, stopUsingWell]);

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
  const itemNamesSet = useRef(new Set(['padlock_key', 'master_key', 'card', 'safe_key', 'handle', 'watermelon', 'cut_pliers', 'hammer', 'wood_plank_item', 'vase']));
  
  const neededClearance = PLAYER_HEIGHT - CROUCH_HEIGHT + 0.2;

  // ===== STATE GUARDING: Track last IDs to prevent unnecessary React updates =====
  const lastNearbyDoor = useRef<string | null>(null);
  const lastNearbyItem = useRef<string | null>(null);
  const lastNearGuillotine = useRef<boolean>(false);
  const lastNearPlank = useRef<boolean>(false);
  const lastNearTerminal = useRef<boolean>(false);
  const lastNearWire = useRef<string | null>(null);
  const lastNearLock = useRef<boolean>(false);
  const lastNearMainDoor = useRef<boolean>(false);
  const lastNearShaft = useRef<boolean>(false);
  const lastNearHandle = useRef<boolean>(false);
  const lastNearPlankSlot = useRef<boolean>(false);
  const lastNearBed = useRef<string | null>(null);
  const currentBedObject = useRef<THREE.Object3D | null>(null);
  
  // Expose movement ref for mobile controls
  const { setInteract, setGrab, setDrop, setCrouch } = useMobileControls();

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
    
    // Handle screamer camera lock
    if (isScreamerActive && grannyPosition) {
      const player = playerRef.current;
      player.setLinvel({ x: 0, y: 0, z: 0 }, true);
      
      if (!screamerCameraLocked.current) {
        screamerCameraLocked.current = true;
      }
      
      // Calculate look-at point (top of Granny's mesh - head level)
      const grannyTopPoint = grannyPosition.clone();
      grannyTopPoint.y += 3; // Top of Granny's head
      
      const targetQuaternion = new THREE.Quaternion();
      const matrix = new THREE.Matrix4().lookAt(camera.position, grannyTopPoint, camera.up);
      targetQuaternion.setFromRotationMatrix(matrix);
      
      // Apply rotation
      camera.quaternion.copy(targetQuaternion);
      
      // Update flashlight to point at Granny
      if (flashlightRef.current) {
        const flashlight = flashlightRef.current;
        
        // Position flashlight at camera position
        flashlightOffset.current.set(0, -0.2, 0);
        flashlightOffset.current.applyQuaternion(camera.quaternion);
        flashlight.position.copy(camera.position).add(flashlightOffset.current);
        
        // Point flashlight at Granny's head
        camera.getWorldDirection(lookDirection.current);
        flashlight.target.position.copy(flashlight.position).add(lookDirection.current.multiplyScalar(5));
        flashlight.target.updateMatrixWorld();
      }
      
      return;
    } else if (screamerCameraLocked.current) {
      screamerCameraLocked.current = false;
    }
    
    // Stop game if player has escaped, menu is open, game over, or showing day message
    if (hasEscaped || inGameMenuOpen || gameOver || showDayMessage) {
      // Freeze player movement
      const player = playerRef.current;
      player.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const player = playerRef.current;
    const velocity = player.linvel();
    const playerPosition = player.translation();

    // Check if player fell through the attic (Y position below -10)
    if (playerPosition.y < -10 && !isDying) {
      setIsDying(true);
      
      // Wait 1 second, then trigger next day and respawn
      setTimeout(() => {
        nextDay();
        
        // Reset player position after short delay
        setTimeout(() => {
          if (playerRef.current && playerSpawnArray) {
            playerRef.current.setTranslation({ x: playerSpawnArray[0], y: playerSpawnArray[1], z: playerSpawnArray[2] }, true);
            playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            playerRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            
            // Reset camera rotation to initial position
            camera.rotation.set(0, -Math.PI / 2, 0);
          }
          setIsDying(false);
        }, 500);
      }, 1000);
    }

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
    let foundItem: string | null = null;
    let foundGuillotine = false;
    let foundPlank = false;
    let foundTerminal = false;
    let foundWire: string | null = null;
    let foundLock = false;
    let foundMainDoor = false;
    let foundWellShaft = false;
    let foundWellHandle = false;
    let foundPlankSlot = false;
    let foundBed: string | null = null;

    for (let i = 0; i < intersects.length; i++) {
      const intersect = intersects[i];
      if (intersect.distance <= INTERACTION_DISTANCE) {
        // Check if object or its parent has door data
        let obj: THREE.Object3D | null = intersect.object;
        while (obj) {
          if (obj.userData?.isDoor && obj.userData?.doorId) {
            const doorId = obj.userData.doorId;
            // Don't detect safe door as nearby if it's already been opened
            if (doorId === 'safe_door001') {
              const safeOpened = useSafe.getState().safeOpened;
              if (!safeOpened) {
                foundDoor = doorId;
              }
            } else {
              foundDoor = doorId;
            }
            break;
          }
          // Check for wood plank on door - only if holding hammer and not chipped off yet
          if (heldItem === 'hammer' && !isChippedOff && obj.name === 'wood_plank') {
            foundPlank = true;
            break;
          }
          // Check for wood plank slot - only if holding plank item and not placed yet
          if (heldItem === 'wood_plank_item' && !plankPlaced && obj.name === 'wood_plank_slot') {
            foundPlankSlot = true;
            break;
          }
          // Check for terminal - only if holding card
          if (heldItem === 'card' && obj.name === 'terminal') {
            foundTerminal = true;
            break;
          }
          // Check for door lock - only if holding padlock key
          if (heldItem === 'padlock_key') {
            const lockOpened = useEscapeDoor.getState().lockOpened;
            if (obj.name === 'door_lock' && !lockOpened) {
              foundLock = true;
              break;
            }
          }
          // Check for main door (escape door)
          if (obj.name === 'main_door') {
            // Only mark as found if holding master key
            if (heldItem === 'master_key') {
              foundMainDoor = true;
              break;
            }
          }
          // Check for wires - only if holding cut pliers
          if (heldItem === 'cut_pliers') {
            const wiresState = useWires.getState();
            if (obj.name === 'door_wire' && !wiresState.doorWireCut) {
              foundWire = 'door_wire';
              break;
            } else if ((obj.name === 'shield_wire' || obj.name === 'shield_wire002' || 
                       obj.name === 'shield_wire003') && !wiresState.shieldWireCut) {
              foundWire = obj.name;
              break;
            } else if (obj.name === 'attic_wire' && !wiresState.atticWireCut) {
              foundWire = 'attic_wire';
              break;
            }
          }
          // Check for items (using Set for faster lookup)
          if (itemNamesSet.current.has(obj.name)) {
            foundItem = obj.name;
            break;
          }
          // Check for well shaft - only if holding handle and not set yet
          if (heldItem === 'handle') {
            const handleSet = useWell.getState().handleSet;
            if ((obj.name === 'shaft001' || obj.name === 'Cylinder024' || obj.name === 'Cylinder024_1') && !handleSet) {
              foundWellShaft = true;
              break;
            }
          }
          // Check for well handle - only after it's been set
          if (obj.name === 'handle001') {
            const handleSet = useWell.getState().handleSet;
            if (handleSet) {
              foundWellHandle = true;
              break;
            }
          }
          // Check for beds - only if not already hiding
          const currentlyHiding = useBedHiding.getState().isHiding;
          if (!currentlyHiding && (obj.name === 'bed001' || obj.name === 'bed002' || obj.name === 'bed003')) {
            foundBed = obj.name;
            currentBedObject.current = obj;
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
        if (foundDoor || foundItem || foundGuillotine || foundPlank || foundTerminal || foundWire || foundLock || foundMainDoor || foundWellShaft || foundWellHandle || foundPlankSlot || foundBed) break;
      }
    }

    // ===== STATE GUARDING: Only update React state if values changed =====
    if (foundDoor !== lastNearbyDoor.current) {
      setNearbyDoor(foundDoor);
      lastNearbyDoor.current = foundDoor;
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
    
    if (foundLock !== lastNearLock.current) {
      setNearLock(foundLock);
      lastNearLock.current = foundLock;
    }
    
    // Update main door proximity
    if (foundMainDoor !== lastNearMainDoor.current) {
      setNearMainDoor(foundMainDoor);
      lastNearMainDoor.current = foundMainDoor;
    }
    
    // Update well shaft proximity
    if (foundWellShaft !== lastNearShaft.current) {
      setNearShaft(foundWellShaft);
      lastNearShaft.current = foundWellShaft;
    }
    
    // Update well handle proximity
    if (foundWellHandle !== lastNearHandle.current) {
      setNearHandle(foundWellHandle);
      lastNearHandle.current = foundWellHandle;
    }
    
    // Update plank slot proximity
    if (foundPlankSlot !== lastNearPlankSlot.current) {
      setNearPlankSlot(foundPlankSlot);
      lastNearPlankSlot.current = foundPlankSlot;
    }
    
    // Update bed proximity
    if (foundBed !== lastNearBed.current) {
      setNearBed(foundBed);
      lastNearBed.current = foundBed;
      if (!foundBed) {
        currentBedObject.current = null;
      }
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

    // Handle bed hiding position
    if (isHiding && bedPosition) {
      // Move player to bed center at y: 3.1
      player.setTranslation(
        {
          x: bedPosition[0],
          y: 3.1,
          z: bedPosition[2],
        },
        true
      );
      // Stop movement when hiding
      player.setLinvel({ x: 0, y: 0, z: 0 }, true);
      
      // Update camera position
      camera.position.set(
        bedPosition[0],
        3.1,
        bedPosition[2]
      );
      
      // Lock vertical rotation (no up/down look), allow 360° horizontal
      camera.rotation.order = 'YXZ'; // Set rotation order for proper 360° horizontal rotation
      camera.rotation.x = 0;
      camera.rotation.z = 0;
      
      // Update flashlight to follow camera direction when hiding
      if (flashlightRef.current) {
        const flashlight = flashlightRef.current;
        
        // Position flashlight higher when hiding to avoid lighting just the floor
        flashlightOffset.current.set(0, 0.1, 0); // Raised from -0.2 to 0.1
        flashlightOffset.current.applyQuaternion(camera.quaternion);
        flashlight.position.copy(camera.position).add(flashlightOffset.current);
        
        // Point flashlight in the direction camera is looking
        camera.getWorldDirection(lookDirection.current);
        flashlight.target.position.copy(flashlight.position).add(lookDirection.current.multiplyScalar(5));
        flashlight.target.updateMatrixWorld();
      }
      
      return; // Skip movement logic when hiding
    }
    
    // Restore position when standing up from bed
    if (shouldRestorePosition && originalPosition) {
      player.setTranslation(
        {
          x: originalPosition[0],
          y: originalPosition[1],
          z: originalPosition[2],
        },
        true
      );
      clearRestoreFlag();
    }

    // ===== OPTIMIZED MOVEMENT CALCULATION (reusing vectors) =====
    camera.getWorldDirection(direction.current);
    direction.current.y = 0;
    direction.current.normalize();

    right.current.crossVectors(camera.up, direction.current).normalize();

    // Reset moveDirection
    moveDirection.current.set(0, 0, 0);

    // Combine keyboard and mobile movement
    const isForward = movement.current.forward || mobileMovement.forward;
    const isBackward = movement.current.backward || mobileMovement.backward;
    const isLeft = movement.current.left || mobileMovement.left;
    const isRight = movement.current.right || mobileMovement.right;

    if (isForward) {
      moveDirection.current.add(direction.current);
    }
    if (isBackward) {
      moveDirection.current.sub(direction.current);
    }
    if (isLeft) {
      moveDirection.current.add(right.current);
    }
    if (isRight) {
      moveDirection.current.sub(right.current);
    }

    const moveLength = moveDirection.current.length();
    const isMoving = moveLength > 0;
    
    if (isMoving) {
      moveDirection.current.normalize();
      moveDirection.current.multiplyScalar(currentSpeed);
    }

    // Play/pause walk sound based on movement
    if (walkAudioRef.current) {
      if (isMoving && walkAudioRef.current.paused) {
        walkAudioRef.current.play().catch(() => {});
      } else if (!isMoving && !walkAudioRef.current.paused) {
        walkAudioRef.current.pause();
      }
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

    // Apply downward force when in air to make falling faster
    if (velocity.y < -0.1) {
      player.applyImpulse({ x: 0, y: -0.4, z: 0 }, true);
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

  // Mobile control callbacks
  const handleInteract = useCallback(() => {
    if (hasEscaped || inGameMenuOpen) return;
    
    const currentHeldItem = useItems.getState().heldItem;
    const nearPlankSlot = usePlank.getState().nearPlankSlot;
    const plankPlaced = usePlank.getState().plankPlaced;
    
    if (nearPlankSlot && currentHeldItem === 'wood_plank_item' && !plankPlaced) {
      placePlank();
      useItems.getState().dropItem([0, -100, 0]);
      return;
    }
    
    const nearShaft = useWell.getState().nearShaft;
    const handleSet = useWell.getState().handleSet;
    
    if (nearShaft && currentHeldItem === 'handle' && !handleSet) {
      setHandle();
      useItems.getState().dropItem([0, -100, 0]);
      return;
    }
    
    const nearMainDoor = useEscapeDoor.getState().nearMainDoor;
    const isDoorUnlocked = useEscapeDoor.getState().isDoorUnlocked;
    
    if (nearMainDoor && currentHeldItem === 'master_key' && isDoorUnlocked) {
      escape();
      return;
    }
    
    const nearLock = useLock.getState().nearLock;
    const lockOpened = useEscapeDoor.getState().lockOpened;
    
    if (nearLock && currentHeldItem === 'padlock_key' && !lockOpened) {
      openLock();
      return;
    }
    
    const nearWire = useWires.getState().nearWire;
    const wiresState = useWires.getState();
    
    if (nearWire && currentHeldItem === 'cut_pliers') {
      if (nearWire === 'door_wire' && !wiresState.doorWireCut) {
        useWires.getState().cutWire('door_wire');
        cutWire();
        return;
      } else if (nearWire.startsWith('shield_wire') && !wiresState.shieldWireCut) {
        useWires.getState().cutWire(nearWire);
        cutWire();
        return;
      } else if (nearWire === 'attic_wire' && !wiresState.atticWireCut) {
        useWires.getState().cutWire('attic_wire');
        return;
      }
    }
    
    const nearPlank = usePlank.getState().nearPlank;
    const plankChipped = usePlank.getState().isChippedOff;
    
    if (nearPlank && currentHeldItem === 'hammer' && !plankChipped) {
      chipOffPlank();
      return;
    }
    
    const nearTerminal = useTerminal.getState().nearTerminal;
    const cardSwiped = useEscapeDoor.getState().cardSwiped;
    
    if (nearTerminal && currentHeldItem === 'card' && !cardSwiped) {
      swipeCard();
      return;
    }
    
    const nearGuillotine = useGuillotine.getState().nearGuillotine;
    
    if (nearGuillotine && currentHeldItem === 'watermelon') {
      placeWatermelon();
      useItems.getState().dropItem([0, 0, 0]);
      return;
    }
    
    const nearBed = useBedHiding.getState().nearBed;
    const isCurrentlyHiding = useBedHiding.getState().isHiding;
    
    if (nearBed && !isCurrentlyHiding && playerRef.current && currentBedObject.current) {
      const pos = playerRef.current.translation();
      const bedWorldPos = new THREE.Vector3();
      currentBedObject.current.getWorldPosition(bedWorldPos);
      hideInBed(nearBed, [pos.x, pos.y, pos.z], [bedWorldPos.x, bedWorldPos.y, bedWorldPos.z]);
      return;
    } else if (isCurrentlyHiding) {
      standUp();
      return;
    }
    
    const nearbyDoorId = useDoors.getState().nearbyDoor;
    if (nearbyDoorId) {
      if (nearbyDoorId === 'safe_door001') {
        const currentHeldItem = useItems.getState().heldItem;
        const safeOpened = useSafe.getState().safeOpened;
        if (currentHeldItem === 'safe_key' && !safeOpened) {
          toggleDoor(nearbyDoorId);
          openSafe();
        }
      } else {
        toggleDoor(nearbyDoorId);
      }
    }
  }, [hasEscaped, inGameMenuOpen, toggleDoor, placePlank, setHandle, escape, openLock, cutWire, chipOffPlank, swipeCard, placeWatermelon, hideInBed, standUp, openSafe]);

  const handleGrab = useCallback(() => {
    if (hasEscaped || inGameMenuOpen) return;
    
    const nearbyItemName = useItems.getState().nearbyItem;
    const currentHeldItem = useItems.getState().heldItem;
    if (nearbyItemName) {
      if (currentHeldItem && playerRef.current) {
        const pos = playerRef.current.translation();
        dropItem([pos.x, pos.y - 0.5, pos.z]);
      }
      grabItem(nearbyItemName);
    }
  }, [hasEscaped, inGameMenuOpen, grabItem, dropItem]);

  const handleDrop = useCallback(() => {
    if (hasEscaped || inGameMenuOpen) return;
    
    if (useItems.getState().heldItem && playerRef.current) {
      const pos = playerRef.current.translation();
      dropItem([pos.x, pos.y - 0.5, pos.z]);
    }
  }, [hasEscaped, inGameMenuOpen, dropItem]);

  const handleCrouch = useCallback(() => {
    if (hasEscaped || inGameMenuOpen) return;
    
    movement.current.crouch = !movement.current.crouch;
    setIsCrouching(!isCrouching);
  }, [hasEscaped, inGameMenuOpen, isCrouching]);

  // Register mobile control handlers
  useEffect(() => {
    setInteract(handleInteract);
    setGrab(handleGrab);
    setDrop(handleDrop);
    setCrouch(handleCrouch);
  }, [setInteract, setGrab, setDrop, setCrouch, handleInteract, handleGrab, handleDrop, handleCrouch]);

  return (
    <>
      <PointerLockControls 
        ref={controlsRef} 
        enabled={!hasEscaped && !inGameMenuOpen && !gameOver && !isScreamerActive && canEnablePointerLock}
        pointerSpeed={0}
      />

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
        name="player"
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
