import { create } from 'zustand';
import * as THREE from 'three';

interface GrannyState {
  grannySpawn: THREE.Vector3 | null;
  grannySpawnArray: [number, number, number] | null;
  currentPath: THREE.Vector3[];
  currentTargetIndex: number;
  targetPoint: THREE.Vector3 | null;
  speed: number;
  setGrannySpawn: (pos: THREE.Vector3) => void;
  setCurrentPath: (path: THREE.Vector3[]) => void;
  setCurrentTargetIndex: (index: number) => void;
  setTargetPoint: (point: THREE.Vector3 | null) => void;
  resetPath: () => void;
}

export const useGrannyState = create<GrannyState>((set) => ({
  grannySpawn: null,
  grannySpawnArray: null,
  currentPath: [],
  currentTargetIndex: 0,
  targetPoint: null,
  speed: 5,
  setGrannySpawn: (pos) => set({ grannySpawn: pos, grannySpawnArray: [pos.x, pos.y, pos.z] }),
  setCurrentPath: (path) => set({ currentPath: path, currentTargetIndex: 0 }),
  setCurrentTargetIndex: (index) => set({ currentTargetIndex: index }),
  setTargetPoint: (point) => set({ targetPoint: point }),
  resetPath: () => set({ currentPath: [], currentTargetIndex: 0, targetPoint: null }),
}));
