import { create } from 'zustand';
import { useEscapeDoor } from './useEscapeDoor';

interface PlankState {
  isChippedOff: boolean;
  nearPlank: boolean;
  setNearPlank: (near: boolean) => void;
  chipOffPlank: () => void;
}

export const usePlank = create<PlankState>((set) => ({
  isChippedOff: false,
  nearPlank: false,
  setNearPlank: (near) => set({ nearPlank: near }),
  chipOffPlank: () => {
    set({ isChippedOff: true });
    useEscapeDoor.getState().removeBoard();
  },
}));
