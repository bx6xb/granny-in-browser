import { create } from 'zustand';

interface WiresState {
  doorWireCut: boolean;
  shieldWireCut: boolean;
  nearWire: string | null;
  setNearWire: (wireName: string | null) => void;
  cutWire: (wireName: string) => void;
  reset: () => void;
}

export const useWires = create<WiresState>((set) => ({
  doorWireCut: false,
  shieldWireCut: false,
  nearWire: null,
  
  setNearWire: (wireName) => set({ nearWire: wireName }),
  
  cutWire: (wireName) => {
    set((state) => {
      if (wireName === 'door_wire') {
        return { doorWireCut: true };
      } else if (wireName.startsWith('shield_wire')) {
        return { shieldWireCut: true };
      }
      return state;
    });
  },
  
  reset: () => set({ doorWireCut: false, shieldWireCut: false, nearWire: null }),
}));
