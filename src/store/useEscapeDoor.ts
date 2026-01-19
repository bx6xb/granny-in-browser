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
      const newState = {
        wiresCut: newWiresCut,
        isDoorUnlocked: checkUnlocked({ ...state, wiresCut: newWiresCut }),
      };
      console.log('[EscapeDoor] Wire cut:', newState);
      return newState;
    });
  },

  removeBoard: () => {
    set((state) => {
      const newState = {
        boardRemoved: true,
        isDoorUnlocked: checkUnlocked({ ...state, boardRemoved: true }),
      };
      console.log('[EscapeDoor] Board removed:', newState);
      return newState;
    });
  },

  openLock: () => {
    set((state) => {
      const newState = {
        lockOpened: true,
        isDoorUnlocked: checkUnlocked({ ...state, lockOpened: true }),
      };
      console.log('[EscapeDoor] Lock opened:', newState);
      return newState;
    });
  },

  swipeCard: () => {
    set((state) => {
      const newState = {
        cardSwiped: true,
        isDoorUnlocked: checkUnlocked({ ...state, cardSwiped: true }),
      };
      console.log('[EscapeDoor] Card swiped:', newState);
      return newState;
    });
  },

  reset: () => {
    set({ ...initialState, isDoorUnlocked: false });
  },
}));
