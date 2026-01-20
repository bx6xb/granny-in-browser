import { create } from 'zustand';

export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameScreen = 'mainMenu' | 'settings' | 'game';

interface GameSettingsState {
  screen: GameScreen;
  difficulty: Difficulty;
  volume: number;
  setScreen: (screen: GameScreen) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setVolume: (volume: number) => void;
  startGame: () => void;
}

export const useGameSettings = create<GameSettingsState>((set) => ({
  screen: 'mainMenu',
  difficulty: 'normal',
  volume: 20,
  setScreen: (screen) => set({ screen }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setVolume: (volume) => set({ volume }),
  startGame: () => set({ screen: 'game' }),
}));
