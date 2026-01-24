import { create } from 'zustand';

interface ShieldsState {
  activeShieldId: number; // 1, 2, or 3
  initializeActiveShield: () => void;
  reset: () => void;
}

export const useShields = create<ShieldsState>((set, get) => ({
  activeShieldId: 1, // Default value, will be randomized

  initializeActiveShield: () => {
    // Only initialize if not already set (to maintain consistency across renders)
    const current = get().activeShieldId;
    if (current === 1) {
      // Only randomize on first call
      const randomShield = Math.floor(Math.random() * 3) + 1; // Random 1, 2, or 3
      set({ activeShieldId: randomShield });
    }
  },
  reset: () => set({ activeShieldId: 1 }),
}));
