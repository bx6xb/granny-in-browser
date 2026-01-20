import { create } from 'zustand';

interface WiresState {
  doorWireCut: boolean;
  shieldWireCut: boolean;
  atticWireCut: boolean;
  nearWire: string | null;
  setNearWire: (wireName: string | null) => void;
  cutWire: (wireName: string) => void;
  reset: () => void;
}

export const useWires = create<WiresState>((set) => ({
  doorWireCut: false,
  shieldWireCut: false,
  atticWireCut: false,
  nearWire: null,
  
  setNearWire: (wireName) => set({ nearWire: wireName }),
  
  cutWire: (wireName) => {
    // Play cut sound
    const audio = new Audio('/sounds/cut.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.warn('Cut sound play failed:', err));
    
    set((state) => {
      if (wireName === 'door_wire') {
        return { doorWireCut: true };
      } else if (wireName.startsWith('shield_wire')) {
        return { shieldWireCut: true };
      } else if (wireName === 'attic_wire') {
        return { atticWireCut: true };
      }
      return state;
    });
  },
  
  reset: () => set({ doorWireCut: false, shieldWireCut: false, atticWireCut: false, nearWire: null }),
}));
