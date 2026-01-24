import { create } from 'zustand';

interface ClosetHidingState {
  isHiding: boolean;
  setHiding: (hiding: boolean) => void;
  reset: () => void;
}

export const useClosetHiding = create<ClosetHidingState>((set) => ({
  isHiding: false,
  setHiding: (hiding) => set({ isHiding: hiding }),
  reset: () => set({ isHiding: false }),
}));
