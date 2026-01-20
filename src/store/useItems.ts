import { create } from 'zustand';
import { generateItemSpawns } from '../utils/itemSpawner';

interface ItemsState {
  nearbyItem: string | null;
  heldItem: string | null;
  droppedPositions: { [key: string]: [number, number, number] };
  itemInsideWatermelon: string;
  itemSlots: { [key: string]: string };
  spawnPositions: { [key: string]: [number, number, number] | null };
  setNearbyItem: (itemName: string | null) => void;
  grabItem: (itemName: string) => void;
  dropItem: (position: [number, number, number]) => void;
  isItemHeld: (itemName: string) => boolean;
  getItemPosition: (itemName: string, defaultPosition: [number, number, number]) => [number, number, number];
  setSpawnPosition: (itemName: string, position: [number, number, number]) => void;
  reset: () => void;
}

// Function to generate new item spawns
const generateNewItemSpawns = () => {
  const selectedSeed = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
  return generateItemSpawns(selectedSeed);
};

// Initial spawns
const initialSpawns = generateNewItemSpawns();

export const useItems = create<ItemsState>((set, get) => ({
  nearbyItem: null,
  heldItem: null,
  droppedPositions: {},
  itemInsideWatermelon: initialSpawns.watermelonItem,
  itemSlots: initialSpawns.itemSlots,
  spawnPositions: {},
  
  setNearbyItem: (itemName) => set({ nearbyItem: itemName }),
  
  grabItem: (itemName) => {
    const { heldItem, droppedPositions } = get();
    // If already holding an item, drop it first
    if (heldItem) {
      // Store the old item as dropped at origin (will be repositioned by Player)
      set({ 
        heldItem: itemName,
        nearbyItem: null,
        droppedPositions: {
          ...droppedPositions,
          [heldItem]: [0, -100, 0] // Temporary position, will be updated by Player
        }
      });
    } else {
      set({ 
        heldItem: itemName,
        nearbyItem: null 
      });
    }
  },
  
  dropItem: (position) => {
    const { heldItem, droppedPositions } = get();
    if (heldItem) {
      set({ 
        heldItem: null,
        droppedPositions: {
          ...droppedPositions,
          [heldItem]: position
        }
      });
    }
  },
  
  isItemHeld: (itemName) => {
    return get().heldItem === itemName;
  },
  
  getItemPosition: (itemName, defaultPosition) => {
    const { droppedPositions, spawnPositions } = get();
    return droppedPositions[itemName] || spawnPositions[itemName] || defaultPosition;
  },

  setSpawnPosition: (itemName, position) => {
    set((state) => ({
      spawnPositions: {
        ...state.spawnPositions,
        [itemName]: position,
      },
    }));
  },

  reset: () => {
    const newSpawns = generateNewItemSpawns();
    set({
      nearbyItem: null,
      heldItem: null,
      droppedPositions: {},
      itemInsideWatermelon: newSpawns.watermelonItem,
      itemSlots: newSpawns.itemSlots,
      spawnPositions: {},
    });
  },
}));
