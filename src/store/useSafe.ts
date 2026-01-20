import { create } from 'zustand';

interface SafeState {
  safeOpened: boolean;
  openSafe: () => void;
  reset: () => void;
}

export const useSafe = create<SafeState>((set) => ({
  safeOpened: false,
  openSafe: () => set({ safeOpened: true }),
  reset: () => set({ safeOpened: false }),
}));
