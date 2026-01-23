import { create } from 'zustand';
import * as THREE from 'three';

interface ScreamerState {
  isScreamerActive: boolean;
  grannyPosition: THREE.Vector3 | null;
  startScreamer: (grannyPos: THREE.Vector3) => void;
  endScreamer: () => void;
}

export const useScreamer = create<ScreamerState>((set) => ({
  isScreamerActive: false,
  grannyPosition: null,
  startScreamer: (grannyPos) => set({ isScreamerActive: true, grannyPosition: grannyPos }),
  endScreamer: () => set({ isScreamerActive: false, grannyPosition: null }),
}));
