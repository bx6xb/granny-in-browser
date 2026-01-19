import { create } from 'zustand';

interface ItemsState {
  nearbyItem: string | null;
  heldItem: string | null;
  droppedPositions: { [key: string]: [number, number, number] };
  itemInsideWatermelon: string; // The item hidden inside the watermelon (key or card)
  setNearbyItem: (itemName: string | null) => void;
  grabItem: (itemName: string) => void;
  dropItem: (position: [number, number, number]) => void;
  isItemHeld: (itemName: string) => boolean;
  getItemPosition: (itemName: string, defaultPosition: [number, number, number]) => [number, number, number];
}

export const useItems = create<ItemsState>((set, get) => ({
  nearbyItem: null,
  heldItem: null,
  droppedPositions: {},
  itemInsideWatermelon: 'master_key', // Change this to any key or 'card'
  
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
    const { droppedPositions } = get();
    return droppedPositions[itemName] || defaultPosition;
  },
}));
