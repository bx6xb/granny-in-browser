import { create } from 'zustand';

interface LockState {
  nearLock: boolean;
  setNearLock: (near: boolean) => void;
  reset: () => void;
}

export const useLock = create<LockState>((set) => ({
  nearLock: false,
  setNearLock: (near) => set({ nearLock: near }),
  reset: () => set({ nearLock: false }),
}));
