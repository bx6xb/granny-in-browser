import { create } from 'zustand';

interface GuillotineState {
  watermelonPlaced: boolean;
  bladeDropped: boolean;
  itemRevealed: boolean;
  nearGuillotine: boolean;
  setNearGuillotine: (near: boolean) => void;
  placeWatermelon: () => void;
  dropBlade: () => void;
  revealItem: () => void;
  reset: () => void;
}

export const useGuillotine = create<GuillotineState>((set) => ({
  watermelonPlaced: false,
  bladeDropped: false,
  itemRevealed: false,
  nearGuillotine: false,

  setNearGuillotine: (near) => set({ nearGuillotine: near }),

  placeWatermelon: () => set({ watermelonPlaced: true }),

  dropBlade: () => set({ bladeDropped: true }),

  revealItem: () => set({ itemRevealed: true }),

  reset: () =>
    set({
      watermelonPlaced: false,
      bladeDropped: false,
      itemRevealed: false,
      nearGuillotine: false,
    }),
}));
