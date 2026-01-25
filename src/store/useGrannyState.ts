import { create } from 'zustand';
import * as THREE from 'three';

type GrannyMode = 'patrol' | 'investigating' | 'waiting';

interface GrannyState {
  grannySpawn: THREE.Vector3 | null;
  grannySpawnArray: [number, number, number] | null;
  currentPath: THREE.Vector3[];
  currentTargetIndex: number;
  targetPoint: THREE.Vector3 | null;
  mode: GrannyMode;
  patrolSpeed: number;
  investigationSpeed: number;
  waitTime: number;
  waitTimer: number;
  hasSeenPlayer: boolean;
  shouldReinitialize: boolean;
  setGrannySpawn: (pos: THREE.Vector3) => void;
  setCurrentPath: (path: THREE.Vector3[]) => void;
  setCurrentTargetIndex: (index: number) => void;
  setTargetPoint: (point: THREE.Vector3 | null) => void;
  setMode: (mode: GrannyMode) => void;
  setWaitTimer: (time: number) => void;
  resetPath: () => void;
  startInvestigation: (soundPosition: THREE.Vector3) => void;
  setInvestigationSpeed: (speed: number) => void;
  setHasSeenPlayer: (seen: boolean) => void;
  triggerReinitialize: () => void;
  resetReinitializeFlag: () => void;
}

export const useGrannyState = create<GrannyState>((set) => ({
  grannySpawn: null,
  grannySpawnArray: null,
  currentPath: [],
  currentTargetIndex: 0,
  targetPoint: null,
  mode: 'patrol',
  patrolSpeed: 5,
  investigationSpeed: 7,
  waitTime: 4,
  waitTimer: 0,
  hasSeenPlayer: false,
  shouldReinitialize: false,
  setGrannySpawn: (pos) => set({ grannySpawn: pos, grannySpawnArray: [pos.x, pos.y, pos.z] }),
  setCurrentPath: (path) => set({ currentPath: path, currentTargetIndex: 0 }),
  setCurrentTargetIndex: (index) => set({ currentTargetIndex: index }),
  setTargetPoint: (point) => set({ targetPoint: point }),
  setMode: (mode) => set({ mode }),
  setWaitTimer: (time) => set({ waitTimer: time }),
  resetPath: () => set({ currentPath: [], currentTargetIndex: 0, targetPoint: null }),
  startInvestigation: (soundPosition) =>
    set({
      mode: 'investigating',
      targetPoint: soundPosition,
      currentPath: [],
      currentTargetIndex: 0,
    }),
  setInvestigationSpeed: (speed) => set({ investigationSpeed: speed }),
  setHasSeenPlayer: (seen) => set({ hasSeenPlayer: seen }),
  triggerReinitialize: () => set({ shouldReinitialize: true }),
  resetReinitializeFlag: () => set({ shouldReinitialize: false }),
}));
