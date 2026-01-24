import { create } from 'zustand';
import { useGameSettings } from './useGameSettings';

export interface DoorState {
  isOpen: boolean;
  isRotating: boolean;
  currentRotation: number;
  targetRotation: number;
  openDirection: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
}

interface DoorsState {
  doors: Map<string, DoorState>;
  nearbyDoor: string | null;

  initializeDoor: (doorId: string, openDirection: 1 | -1) => void;
  setDoorRotating: (doorId: string, isRotating: boolean) => void;
  updateDoorRotation: (doorId: string, rotation: number) => void;
  toggleDoor: (doorId: string) => void;
  openDoor: (doorId: string) => void;
  setNearbyDoor: (doorId: string | null) => void;
  getDoorState: (doorId: string) => DoorState | undefined;
  closeAllDoors: () => void;
  reset: () => void;
}

const playDoorSound = (doorId: string, isOpening: boolean) => {
  const actualDoors = ['barn_door', 'main_door', 'room_door'];
  const isActualDoor = actualDoors.some((prefix) => doorId.startsWith(prefix));

  let soundPath: string;

  if (isActualDoor) {
    soundPath = isOpening ? '/sounds/door_open.mp3' : '/sounds/door_close.mp3';
  } else {
    soundPath = '/sounds/closet_door.mp3';
  }

  const audio = new Audio(soundPath);
  const { volume } = useGameSettings.getState();
  audio.volume = (volume / 100) * 0.5;
  audio.play().catch((err) => console.warn('Sound play failed:', err));
};

const createDefaultDoorState = (openDirection: 1 | -1 = 1): DoorState => ({
  isOpen: false,
  isRotating: false,
  currentRotation: 0,
  targetRotation: 0,
  openDirection,
});

export const useDoors = create<DoorsState>((set, get) => ({
  doors: new Map(),
  nearbyDoor: null,

  initializeDoor: (doorId: string, openDirection: 1 | -1 = 1) => {
    set((state) => {
      const newDoors = new Map(state.doors);
      if (!newDoors.has(doorId)) {
        newDoors.set(doorId, createDefaultDoorState(openDirection));
      }
      return { doors: newDoors };
    });
  },

  setDoorRotating: (doorId: string, isRotating: boolean) => {
    set((state) => {
      const newDoors = new Map(state.doors);
      const door = newDoors.get(doorId);
      if (door) {
        newDoors.set(doorId, { ...door, isRotating });
      }
      return { doors: newDoors };
    });
  },

  updateDoorRotation: (doorId: string, rotation: number) => {
    set((state) => {
      const newDoors = new Map(state.doors);
      const door = newDoors.get(doorId);
      if (door) {
        newDoors.set(doorId, { ...door, currentRotation: rotation });
      }
      return { doors: newDoors };
    });
  },

  toggleDoor: (doorId: string) => {
    set((state) => {
      const newDoors = new Map(state.doors);
      const door = newDoors.get(doorId);
      if (door && !door.isRotating) {
        const newIsOpen = !door.isOpen;
        const targetRotation = newIsOpen ? (Math.PI / 2) * door.openDirection : 0;

        playDoorSound(doorId, newIsOpen);

        newDoors.set(doorId, {
          ...door,
          isOpen: newIsOpen,
          targetRotation,
          isRotating: true,
        });
      }
      return { doors: newDoors };
    });
  },

  openDoor: (doorId: string) => {
    set((state) => {
      const newDoors = new Map(state.doors);
      const door = newDoors.get(doorId);
      if (door && !door.isOpen && !door.isRotating) {
        const targetRotation = (Math.PI / 2) * door.openDirection;

        playDoorSound(doorId, true);

        newDoors.set(doorId, {
          ...door,
          isOpen: true,
          targetRotation,
          isRotating: true,
        });
      }
      return { doors: newDoors };
    });
  },

  setNearbyDoor: (doorId: string | null) => {
    set({ nearbyDoor: doorId });
  },

  getDoorState: (doorId: string) => {
    return get().doors.get(doorId);
  },

  closeAllDoors: () => {
    set((state) => {
      const newDoors = new Map(state.doors);
      newDoors.forEach((door, doorId) => {
        if (door.isOpen) {
          newDoors.set(doorId, {
            ...door,
            isOpen: false,
            targetRotation: 0,
            currentRotation: 0,
            isRotating: false,
          });
        }
      });
      return { doors: newDoors };
    });
  },

  reset: () => {
    set({ doors: new Map(), nearbyDoor: null });
  },
}));
