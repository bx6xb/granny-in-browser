import { create } from 'zustand';

interface SafeState {
  safeOpened: boolean;
  openSafe: () => void;
}

export const useSafe = create<SafeState>((set) => ({
  safeOpened: false,
  openSafe: () => set({ safeOpened: true }),
}));
