import { create } from 'zustand';
import * as THREE from 'three';

interface PlayerState {
  playerSpawn: THREE.Vector3 | null;
  playerSpawnArray: [number, number, number] | null;
  shouldResetCamera: boolean;
  setPlayerSpawn: (pos: THREE.Vector3) => void;
  triggerCameraReset: () => void;
  clearCameraReset: () => void;
}

export const usePlayerState = create<PlayerState>((set) => ({
  playerSpawn: null,
  playerSpawnArray: null,
  shouldResetCamera: false,
  setPlayerSpawn: (pos) => set({ playerSpawn: pos, playerSpawnArray: [pos.x, pos.y, pos.z] }),
  triggerCameraReset: () => set({ shouldResetCamera: true }),
  clearCameraReset: () => set({ shouldResetCamera: false }),
}));
