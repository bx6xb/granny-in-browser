import { create } from 'zustand';
import * as THREE from 'three';

interface PlayerState {
  playerSpawn: THREE.Vector3 | null;
  playerSpawnArray: [number, number, number] | null;
  setPlayerSpawn: (pos: THREE.Vector3) => void;
}

export const usePlayerState = create<PlayerState>((set) => ({
  playerSpawn: null,
  playerSpawnArray: null,
  setPlayerSpawn: (pos) => set({ playerSpawn: pos, playerSpawnArray: [pos.x, pos.y, pos.z] }),
}));
