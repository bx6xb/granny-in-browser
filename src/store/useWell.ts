import { create } from 'zustand';
import { useGameSettings } from './useGameSettings';

interface WellState {
  handleSet: boolean;
  nearShaft: boolean;
  nearHandle: boolean;
  isUsingWell: boolean;
  handleRotation: number;
  bucketHeight: number; // 0 to 4.7 (meters raised)
  setNearShaft: (near: boolean) => void;
  setNearHandle: (near: boolean) => void;
  setHandle: () => void;
  startUsingWell: () => void;
  stopUsingWell: () => void;
  updateWellProgress: (delta: number) => void;
  reset: () => void;
}

const WELL_SPEED = 1.0; // meters per second
let wellAudio: HTMLAudioElement | null = null;
let wellPlayPromise: Promise<void> | null = null;

export const useWell = create<WellState>((set, get) => ({
  handleSet: false,
  nearShaft: false,
  nearHandle: false,
  isUsingWell: false,
  handleRotation: 0,
  bucketHeight: 0,
  
  setNearShaft: (near) => set({ nearShaft: near }),
  
  setNearHandle: (near) => set({ nearHandle: near }),
  
  setHandle: () => {
    set({ handleSet: true });
  },
  
  startUsingWell: () => {
    const { bucketHeight } = get();
    if (bucketHeight >= 4.7) return;
    
    if (!wellAudio) {
      wellAudio = new Audio('/sounds/well.mp3');
      wellAudio.loop = true;
    }
    const { volume } = useGameSettings.getState();
    wellAudio.volume = (volume / 100) * 0.5;
    wellPlayPromise = wellAudio.play().catch(() => {});
    set({ isUsingWell: true });
  },
  
  stopUsingWell: async () => {
    if (wellAudio && wellPlayPromise) {
      await wellPlayPromise;
      wellAudio.pause();
      wellAudio.currentTime = 0;
    }
    set({ isUsingWell: false });
  },
  
  updateWellProgress: (delta) => {
    const { isUsingWell, bucketHeight, handleRotation } = get();
    if (isUsingWell && bucketHeight < 4.7) {
      const newHeight = Math.min(bucketHeight + delta * WELL_SPEED, 4.7);
      const rotationSpeed = 2; // radians per second
      set({ 
        bucketHeight: newHeight,
        handleRotation: handleRotation + delta * rotationSpeed
      });
      
      if (newHeight >= 4.7) {
        if (wellAudio && wellPlayPromise) {
          wellPlayPromise.then(() => {
            wellAudio!.pause();
            wellAudio!.currentTime = 0;
          });
        }
        set({ isUsingWell: false });
      }
    }
  },
  reset: () => {
    if (wellAudio) {
      wellAudio.pause();
      wellAudio.currentTime = 0;
    }
    set({ handleSet: false, nearShaft: false, nearHandle: false, isUsingWell: false, handleRotation: 0, bucketHeight: 0 });
  },
}));
