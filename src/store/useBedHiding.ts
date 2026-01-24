import { create } from 'zustand';

interface BedHidingState {
  isHiding: boolean;
  nearBed: string | null;
  originalPosition: [number, number, number] | null;
  bedPosition: [number, number, number] | null;
  shouldRestorePosition: boolean;
  setNearBed: (bedName: string | null) => void;
  hideInBed: (
    bedName: string,
    playerPosition: [number, number, number],
    bedPosition: [number, number, number]
  ) => void;
  standUp: () => void;
  clearRestoreFlag: () => void;
  reset: () => void;
}

export const useBedHiding = create<BedHidingState>((set) => ({
  isHiding: false,
  nearBed: null,
  originalPosition: null,
  bedPosition: null,
  shouldRestorePosition: false,
  setNearBed: (bedName) => set({ nearBed: bedName }),
  hideInBed: (bedName, playerPosition, bedPosition) =>
    set({
      isHiding: true,
      nearBed: bedName,
      originalPosition: playerPosition,
      bedPosition: bedPosition,
      shouldRestorePosition: false,
    }),
  standUp: () => set({ isHiding: false, shouldRestorePosition: true }),
  clearRestoreFlag: () =>
    set({ shouldRestorePosition: false, originalPosition: null, bedPosition: null }),
  reset: () =>
    set({
      isHiding: false,
      nearBed: null,
      originalPosition: null,
      bedPosition: null,
      shouldRestorePosition: false,
    }),
}));
