import { create } from 'zustand';

export interface EscapeDoorStatus {
  wiresCut: number;
  boardRemoved: boolean;
  lockOpened: boolean;
  cardSwiped: boolean;
}

interface EscapeDoorState extends EscapeDoorStatus {
  isDoorUnlocked: boolean;
  cutWire: () => void;
  removeBoard: () => void;
  openLock: () => void;
  swipeCard: () => void;
  reset: () => void;
}

const initialState: EscapeDoorStatus = {
  wiresCut: 0,
  boardRemoved: false,
  lockOpened: false,
  cardSwiped: false,
};

const checkUnlocked = (state: EscapeDoorStatus): boolean => {
  return state.wiresCut === 2 && 
         state.boardRemoved && 
         state.lockOpened && 
         state.cardSwiped;
};

export const useEscapeDoor = create<EscapeDoorState>((set, get) => ({
  ...initialState,
  isDoorUnlocked: false,

  cutWire: () => {
    set((state) => {
      if (state.wiresCut >= 2) return state;
      const newWiresCut = state.wiresCut + 1;
      return {
        wiresCut: newWiresCut,
        isDoorUnlocked: checkUnlocked({ ...state, wiresCut: newWiresCut }),
      };
    });
  },

  removeBoard: () => {
    set((state) => ({
      boardRemoved: true,
      isDoorUnlocked: checkUnlocked({ ...state, boardRemoved: true }),
    }));
  },

  openLock: () => {
    set((state) => ({
      lockOpened: true,
      isDoorUnlocked: checkUnlocked({ ...state, lockOpened: true }),
    }));
  },

  swipeCard: () => {
    set((state) => ({
      cardSwiped: true,
      isDoorUnlocked: checkUnlocked({ ...state, cardSwiped: true }),
    }));
  },

  reset: () => {
    set({ ...initialState, isDoorUnlocked: false });
  },
}));
