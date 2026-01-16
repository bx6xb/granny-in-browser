import { create } from 'zustand';

interface DrawerState {
  openDrawers: Record<string, boolean>;
  nearbyDrawer: string | null;
  toggleDrawer: (drawerId: string) => void;
  setNearbyDrawer: (drawerId: string | null) => void;
}

export const useDrawers = create<DrawerState>((set) => ({
  openDrawers: {},
  nearbyDrawer: null,
  toggleDrawer: (drawerId) =>
    set((state) => ({
      openDrawers: {
        ...state.openDrawers,
        [drawerId]: !state.openDrawers[drawerId],
      },
    })),
  setNearbyDrawer: (drawerId) => set({ nearbyDrawer: drawerId }),
}));
