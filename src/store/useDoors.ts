import { create } from 'zustand';

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
  setNearbyDoor: (doorId: string | null) => void;
  getDoorState: (doorId: string) => DoorState | undefined;
}

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

  setNearbyDoor: (doorId: string | null) => {
    set({ nearbyDoor: doorId });
  },

  getDoorState: (doorId: string) => {
    return get().doors.get(doorId);
  },
}));
