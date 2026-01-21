import { create } from 'zustand';

interface MobileControlsState {
  interact: () => void;
  grab: () => void;
  drop: () => void;
  crouch: () => void;
  setInteract: (fn: () => void) => void;
  setGrab: (fn: () => void) => void;
  setDrop: (fn: () => void) => void;
  setCrouch: (fn: () => void) => void;
}

export const useMobileControls = create<MobileControlsState>((set) => ({
  interact: () => {},
  grab: () => {},
  drop: () => {},
  crouch: () => {},
  setInteract: (fn) => set({ interact: fn }),
  setGrab: (fn) => set({ grab: fn }),
  setDrop: (fn) => set({ drop: fn }),
  setCrouch: (fn) => set({ crouch: fn }),
}));
