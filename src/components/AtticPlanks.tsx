import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useRef, useEffect } from 'react';
import { useAtticPlanks } from '../store/useAtticPlanks';
import { useGameSettings } from '../store/useGameSettings';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface AtticPlanksProps {
  nodes: any;
  materials: any;
}

export function AtticPlanks({ nodes, materials }: AtticPlanksProps) {
  const { activated, disappeared, activatePlanks, disappearPlanks } = useAtticPlanks();
  const { volume } = useGameSettings();
  const { camera } = useThree();
  
  const plank1Ref = useRef<RapierRigidBody>(null);
  const plank2Ref = useRef<RapierRigidBody>(null);
  const plank3Ref = useRef<RapierRigidBody>(null);
  const plank4Ref = useRef<RapierRigidBody>(null);
  
  const audioLoaderRef = useRef<THREE.AudioLoader | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const listenerRef = useRef<THREE.AudioListener | null>(null);
  
  useEffect(() => {
    if (!listenerRef.current) {
      listenerRef.current = new THREE.AudioListener();
      camera.add(listenerRef.current);
    }
    
    if (!audioLoaderRef.current) {
      audioLoaderRef.current = new THREE.AudioLoader();
      audioLoaderRef.current.load('/sounds/plank.mp3', (buffer) => {
        audioBufferRef.current = buffer;
      });
    }
    
    return () => {
      if (listenerRef.current) {
        camera.remove(listenerRef.current);
      }
    };
  }, [camera]);
  
  const playPlankSound = (position: THREE.Vector3) => {
    if (audioBufferRef.current && listenerRef.current) {
      const sound = new THREE.PositionalAudio(listenerRef.current);
      sound.setBuffer(audioBufferRef.current);
      sound.setRefDistance(5);
      const { volume } = useGameSettings.getState();
      sound.setVolume((volume / 100) * 0.3);
      sound.position.copy(position);
      camera.parent?.add(sound);
      sound.play();
      
      sound.onEnded = () => {
        camera.parent?.remove(sound);
      };
    }
  };
  
  // Apply impulse when activated to make them fall
  useEffect(() => {
    if (activated) {
      const planks = [plank1Ref, plank2Ref, plank3Ref, plank4Ref];
      planks.forEach((plankRef) => {
        if (plankRef.current) {
          plankRef.current.applyImpulse({ x: 0, y: -20, z: 0 }, true);
        }
      });
    }
  }, [activated]);
  
  // Start disappear timer when activated
  useEffect(() => {
    if (activated && !disappeared) {
      const timer = setTimeout(() => {
        disappearPlanks();
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [activated, disappeared, disappearPlanks]);
  
  // Don't render if disappeared
  if (disappeared) return null;
  
  const handleCollision = () => {
    if (!activated) {
      activatePlanks();
    }
  };
  
  return (
    <>
      <RigidBody
        ref={plank1Ref}
        position={[7.237, 7.831, -9.409]}
        type={activated ? 'dynamic' : 'fixed'}
        colliders="hull"
        onCollisionEnter={() => {
          handleCollision();
          if (plank1Ref.current) {
            const pos = plank1Ref.current.translation();
            playPlankSound(new THREE.Vector3(pos.x, pos.y, pos.z));
          }
        }}
        mass={20}
        gravityScale={activated ? 2 : 0}
        linearDamping={0.5}
        angularDamping={0.5}
      >
        <mesh
          name="attic_plank_1001"
          geometry={nodes.attic_plank_1001.geometry}
          material={materials.walls}
        />
      </RigidBody>
      
      <RigidBody
        ref={plank2Ref}
        position={[8.855, 7.831, -9.159]}
        type={activated ? 'dynamic' : 'fixed'}
        colliders="hull"
        onCollisionEnter={() => {
          handleCollision();
          if (plank2Ref.current) {
            const pos = plank2Ref.current.translation();
            playPlankSound(new THREE.Vector3(pos.x, pos.y, pos.z));
          }
        }}
        mass={20}
        gravityScale={activated ? 2 : 0}
        linearDamping={0.5}
        angularDamping={0.5}
      >
        <mesh
          name="attic_plank_2001"
          geometry={nodes.attic_plank_2001.geometry}
          material={materials.walls}
        />
      </RigidBody>
      
      <RigidBody
        ref={plank3Ref}
        position={[9.082, 7.831, -7.73]}
        type={activated ? 'dynamic' : 'fixed'}
        colliders="hull"
        onCollisionEnter={() => {
          handleCollision();
          if (plank3Ref.current) {
            const pos = plank3Ref.current.translation();
            playPlankSound(new THREE.Vector3(pos.x, pos.y, pos.z));
          }
        }}
        mass={20}
        gravityScale={activated ? 2 : 0}
        linearDamping={0.5}
        angularDamping={0.5}
      >
        <mesh
          name="attic_plank_3001"
          geometry={nodes.attic_plank_3001.geometry}
          material={materials.walls}
        />
      </RigidBody>
      
      <RigidBody
        ref={plank4Ref}
        position={[7.54, 7.831, -7.811]}
        type={activated ? 'dynamic' : 'fixed'}
        colliders="hull"
        onCollisionEnter={() => {
          handleCollision();
          if (plank4Ref.current) {
            const pos = plank4Ref.current.translation();
            playPlankSound(new THREE.Vector3(pos.x, pos.y, pos.z));
          }
        }}
        mass={20}
        gravityScale={activated ? 2 : 0}
        linearDamping={0.5}
        angularDamping={0.5}
      >
        <mesh 
          name="attic_plank_4001"
          geometry={nodes.attic_plank_4001.geometry} 
          material={materials.walls}
        />
      </RigidBody>
    </>
  );
}
