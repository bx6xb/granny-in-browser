import { useEffect } from 'react';
import { useGrannyState } from '../store/useGrannyState';
import { usePlayerState } from '../store/usePlayerState';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

export const useHauntedHouse = (nodes: GLTF['nodes']) => {
  const { setGrannySpawn } = useGrannyState();
  const { setPlayerSpawn } = usePlayerState();

  useEffect(() => {
    if ('spawn_granny' in nodes) {
      setGrannySpawn((nodes.spawn_granny as THREE.Object3D).position.clone());
    }
    if ('spawn_player' in nodes) {
      setPlayerSpawn((nodes.spawn_player as THREE.Object3D).position.clone());
    }
    if ('navmesh' in nodes) {
      const navmesh = nodes.navmesh as THREE.Mesh;
      navmesh.visible = false;
    }
  }, [nodes]);
};
