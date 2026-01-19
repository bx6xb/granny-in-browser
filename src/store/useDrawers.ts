import { create } from 'zustand';

interface DrawerState {
  openDrawers: Record<string, boolean>;
  drawerSlideAmounts: Record<string, number>; // 0 to slideDistance
  nearbyDrawer: string | null;
  toggleDrawer: (drawerId: string) => void;
  setNearbyDrawer: (drawerId: string | null) => void;
  setDrawerSlideAmount: (drawerId: string, amount: number) => void;
}

export const useDrawers = create<DrawerState>((set) => ({
  openDrawers: {},
  drawerSlideAmounts: {},
  nearbyDrawer: null,
  toggleDrawer: (drawerId) =>
    set((state) => ({
      openDrawers: {
        ...state.openDrawers,
        [drawerId]: !state.openDrawers[drawerId],
      },
    })),
  setNearbyDrawer: (drawerId) => set({ nearbyDrawer: drawerId }),
  setDrawerSlideAmount: (drawerId, amount) =>
    set((state) => ({
      drawerSlideAmounts: {
        ...state.drawerSlideAmounts,
        [drawerId]: amount,
      },
    })),
}));
