import { create } from 'zustand';
import { useDoors } from './useDoors';

interface DayState {
  currentDay: number;
  showDayMessage: boolean;
  gameOver: boolean;
  nextDay: () => void;
  hideDayMessage: () => void;
  reset: () => void;
}

export const useDayState = create<DayState>((set) => ({
  currentDay: 1,
  showDayMessage: true, // Show Day 1 message on game start
  gameOver: false,

  nextDay: () => {
    // Close all doors when starting next day
    useDoors.getState().closeAllDoors();

    return set((state) => {
      const nextDayNum = state.currentDay + 1;
      if (nextDayNum > 5) {
        return { gameOver: true, showDayMessage: false };
      }
      return { currentDay: nextDayNum, showDayMessage: true };
    });
  },

  hideDayMessage: () => set({ showDayMessage: false }),

  reset: () => set({ currentDay: 1, showDayMessage: true, gameOver: false }),
}));
