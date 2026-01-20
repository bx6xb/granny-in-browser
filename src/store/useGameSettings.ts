import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useItems } from './useItems';
import { useDoors } from './useDoors';
import { useGuillotine } from './useGuillotine';
import { usePlank } from './usePlank';
import { useEscapeDoor } from './useEscapeDoor';
import { useWires } from './useWires';
import { useSafe } from './useSafe';
import { useShields } from './useShields';
import { useAtticPlanks } from './useAtticPlanks';
import { useLock } from './useLock';
import { useTerminal } from './useTerminal';
import { useWell } from './useWell';
import { useDayState } from './useDayState';

export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameScreen = 'mainMenu' | 'settings' | 'game';

interface GameSettingsState {
  screen: GameScreen;
  difficulty: Difficulty;
  volume: number;
  inGameMenuOpen: boolean;
  setScreen: (screen: GameScreen) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setVolume: (volume: number) => void;
  setInGameMenuOpen: (open: boolean) => void;
  startGame: () => void;
  resetGame: () => void;
}

export const useGameSettings = create<GameSettingsState>()(
  persist(
    (set) => ({
      screen: 'mainMenu',
      difficulty: 'normal',
      volume: 20,
      inGameMenuOpen: false,
      setScreen: (screen) => set({ screen }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setVolume: (volume) => set({ volume }),
      setInGameMenuOpen: (open) => set({ inGameMenuOpen: open }),
      startGame: () => {
        // Reset all game state before starting
        useGameSettings.getState().resetGame();
        set({ screen: 'game', inGameMenuOpen: false });
      },
      resetGame: () => {
        // Reset all game stores
        useItems.getState().reset();
        useDoors.getState().reset();
        useGuillotine.getState().reset();
        usePlank.getState().reset();
        useEscapeDoor.getState().reset();
        useWires.getState().reset();
        useSafe.getState().reset();
        useShields.getState().reset();
        useAtticPlanks.getState().reset();
        useLock.getState().reset();
        useTerminal.getState().reset();
        useWell.getState().reset();
        useDayState.getState().reset();
      },
    }),
    {
      name: 'haunted-house-settings',
      partialize: (state) => ({ volume: state.volume }),
    }
  )
);
