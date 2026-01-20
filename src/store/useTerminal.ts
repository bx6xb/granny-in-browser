import { create } from 'zustand';

interface TerminalState {
  nearTerminal: boolean;
  setNearTerminal: (isNear: boolean) => void;
  reset: () => void;
}

export const useTerminal = create<TerminalState>((set) => ({
  nearTerminal: false,
  setNearTerminal: (isNear) => set({ nearTerminal: isNear }),
  reset: () => set({ nearTerminal: false }),
}));
