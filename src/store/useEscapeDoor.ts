import { create } from 'zustand';
import { useGameSettings } from './useGameSettings';

export interface EscapeDoorStatus {
  wiresCut: number;
  boardRemoved: boolean;
  lockOpened: boolean;
  cardSwiped: boolean;
}

interface EscapeDoorState extends EscapeDoorStatus {
  isDoorUnlocked: boolean;
  hasEscaped: boolean;
  nearMainDoor: boolean;
  cutWire: () => void;
  removeBoard: () => void;
  openLock: () => void;
  swipeCard: () => void;
  setNearMainDoor: (near: boolean) => void;
  escape: () => void;
  reset: () => void;
}

const initialState: EscapeDoorStatus = {
  wiresCut: 0,
  boardRemoved: false,
  lockOpened: false,
  cardSwiped: false,
};

const checkUnlocked = (state: EscapeDoorStatus): boolean => {
  return state.wiresCut === 2 && state.boardRemoved && state.lockOpened && state.cardSwiped;
};

export const useEscapeDoor = create<EscapeDoorState>((set, get) => ({
  ...initialState,
  isDoorUnlocked: false,
  hasEscaped: false,
  nearMainDoor: false,

  setNearMainDoor: (near) => set({ nearMainDoor: near }),

  escape: () => {
    set({ hasEscaped: true });
  },

  cutWire: () => {
    set((state) => {
      if (state.wiresCut >= 2) return state;
      const newWiresCut = state.wiresCut + 1;
      const newState = {
        wiresCut: newWiresCut,
        isDoorUnlocked: checkUnlocked({ ...state, wiresCut: newWiresCut }),
      };
      return newState;
    });
  },

  removeBoard: () => {
    set((state) => {
      const newState = {
        boardRemoved: true,
        isDoorUnlocked: checkUnlocked({ ...state, boardRemoved: true }),
      };
      return newState;
    });
  },

  openLock: () => {
    const audio = new Audio('/sounds/lock.mp3');
    const { volume } = useGameSettings.getState();
    audio.volume = (volume / 100) * 0.5;
    audio.play().catch((err) => console.warn('Lock sound play failed:', err));

    set((state) => {
      const newState = {
        lockOpened: true,
        isDoorUnlocked: checkUnlocked({ ...state, lockOpened: true }),
      };
      return newState;
    });
  },

  swipeCard: () => {
    const audio = new Audio('/sounds/terminal.mp3');
    const { volume } = useGameSettings.getState();
    audio.volume = (volume / 100) * 0.5;
    audio.play().catch((err) => console.warn('Terminal sound play failed:', err));

    set((state) => {
      const newState = {
        cardSwiped: true,
        isDoorUnlocked: checkUnlocked({ ...state, cardSwiped: true }),
      };
      return newState;
    });
  },

  reset: () => {
    set({ ...initialState, isDoorUnlocked: false, hasEscaped: false, nearMainDoor: false });
  },
}));
