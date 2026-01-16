import { create } from 'zustand';

interface ItemsState {
  nearbyItem: string | null;
  heldItem: string | null;
  droppedPositions: { [key: string]: [number, number, number] };
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
  
  setNearbyItem: (itemName) => set({ nearbyItem: itemName }),
  
  grabItem: (itemName) => {
    const { heldItem } = get();
    // Only grab if not already holding an item
    if (!heldItem) {
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
