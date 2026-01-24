import { create } from 'zustand';
import { useEscapeDoor } from './useEscapeDoor';
import { useGameSettings } from './useGameSettings';

interface PlankState {
  isChippedOff: boolean;
  nearPlank: boolean;
  nearPlankSlot: boolean;
  plankPlaced: boolean;
  setNearPlank: (near: boolean) => void;
  setNearPlankSlot: (near: boolean) => void;
  chipOffPlank: () => void;
  placePlank: () => void;
  reset: () => void;
}

export const usePlank = create<PlankState>((set) => ({
  isChippedOff: false,
  nearPlank: false,
  nearPlankSlot: false,
  plankPlaced: false,
  setNearPlank: (near) => set({ nearPlank: near }),
  setNearPlankSlot: (near) => set({ nearPlankSlot: near }),
  chipOffPlank: () => {
    set({ isChippedOff: true });
    useEscapeDoor.getState().removeBoard();
  },
  placePlank: () => {
    // Play plank attic sound
    const audio = new Audio('/sounds/plank_attic.mp3');
    const { volume } = useGameSettings.getState();
    audio.volume = (volume / 100) * 0.5;
    audio.play().catch((err) => console.warn('Plank attic sound play failed:', err));

    set({ plankPlaced: true });
  },
  reset: () =>
    set({ isChippedOff: false, nearPlank: false, nearPlankSlot: false, plankPlaced: false }),
}));
