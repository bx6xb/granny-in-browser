import { create } from 'zustand';
import * as THREE from 'three';

interface GrannyState {
  grannySpawn: THREE.Vector3 | null;
  grannySpawnArray: [number, number, number] | null;
  setGrannySpawn: (pos: THREE.Vector3) => void;
}

export const useGrannyState = create<GrannyState>((set) => ({
  grannySpawn: null,
  grannySpawnArray: null,
  setGrannySpawn: (pos) => set({ grannySpawn: pos, grannySpawnArray: [pos.x, pos.y, pos.z] }),
}));
