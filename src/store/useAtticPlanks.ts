import { create } from 'zustand';

interface AtticPlanksState {
  activated: boolean;
  disappeared: boolean;
  activatePlanks: () => void;
  disappearPlanks: () => void;
}

export const useAtticPlanks = create<AtticPlanksState>((set) => ({
  activated: false,
  disappeared: false,
  activatePlanks: () => set({ activated: true }),
  disappearPlanks: () => set({ disappeared: true }),
}));
