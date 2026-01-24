type ItemName =
  | 'watermelon'
  | 'hammer'
  | 'handle'
  | 'card'
  | 'safe_key'
  | 'master_key'
  | 'padlock_key'
  | 'cut_pliers';

interface Seed {
  watermelonItem: 'safe_key' | 'card' | 'padlock_key';
  slotSafe: ItemName;
  slotAttic: ItemName;
  slotWell: ItemName;
  houseItems: ItemName[];
}

const SEEDS: Record<number, Seed> = {
  1: {
    watermelonItem: 'safe_key',
    slotSafe: 'cut_pliers',
    slotAttic: 'master_key',
    slotWell: 'card',
    houseItems: ['watermelon', 'handle', 'hammer', 'padlock_key'],
  },
  2: {
    watermelonItem: 'card',
    slotSafe: 'padlock_key',
    slotAttic: 'safe_key',
    slotWell: 'master_key',
    houseItems: ['watermelon', 'handle', 'hammer', 'cut_pliers'],
  },
  3: {
    watermelonItem: 'padlock_key',
    slotSafe: 'master_key',
    slotAttic: 'card',
    slotWell: 'safe_key',
    houseItems: ['watermelon', 'handle', 'hammer', 'cut_pliers'],
  },
};

// Slot ranges
const SLOT_LG_RANGE = { start: 10, end: 97 }; // slot_lg.010 to slot_lg.097
const SLOT_SM_RANGE = { start: 1, end: 3 }; // slot_sm.001 to slot_sm.003

// Priority slots that must have at least one item
const PRIORITY_SLOTS = [
  'slot_lg040',
  'slot_lg051',
  'slot_lg052',
  'slot_lg057',
  'slot_lg058',
  'slot_lg071',
  'slot_lg072',
  'slot_lg073',
  'slot_lg076',
  'slot_lg079',
];

// Item constraints
const SMALL_ITEMS: ItemName[] = ['card', 'safe_key', 'master_key', 'padlock_key', 'cut_pliers'];
const LARGE_ITEMS: ItemName[] = ['watermelon', 'hammer'];

function getSlotName(type: 'lg' | 'md' | 'sm', num: number): string {
  return `slot_${type}${num.toString().padStart(3, '0')}`;
}

function canSpawnInSlot(item: ItemName, slotType: 'lg' | 'md' | 'sm'): boolean {
  if (slotType === 'sm') {
    return SMALL_ITEMS.includes(item);
  }
  if (slotType === 'md') {
    return !LARGE_ITEMS.includes(item);
  }
  return true; // lg can hold any item
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateItemSpawns(seedNumber: 1 | 2 | 3 = 1): {
  itemSlots: Record<ItemName, string>;
  watermelonItem: string;
} {
  const seed = SEEDS[seedNumber];
  const itemSlots: Record<string, string> = {};
  const usedSlots = new Set<string>();

  // Assign fixed positions
  itemSlots[seed.slotSafe] = 'slot_safe';
  itemSlots[seed.slotAttic] = 'slot_attic';
  itemSlots[seed.slotWell] = 'slot_well';

  // Generate all available slots
  const availableSlots: Array<{ name: string; type: 'lg' | 'md' | 'sm' }> = [];

  for (let i = SLOT_LG_RANGE.start; i <= SLOT_LG_RANGE.end; i++) {
    availableSlots.push({ name: getSlotName('lg', i), type: 'lg' });
  }
  for (let i = SLOT_SM_RANGE.start; i <= SLOT_SM_RANGE.end; i++) {
    availableSlots.push({ name: getSlotName('sm', i), type: 'sm' });
  }

  // Shuffle slots for randomness
  const shuffledSlots = shuffleArray(availableSlots);

  // Ensure at least one item spawns in priority slots
  const prioritySlots = shuffleArray(PRIORITY_SLOTS);
  let itemsToAssign = [...seed.houseItems];
  let priorityItemAssigned = false;

  for (const prioritySlot of prioritySlots) {
    if (priorityItemAssigned) break;
    for (let i = 0; i < itemsToAssign.length; i++) {
      const item = itemsToAssign[i];
      if (canSpawnInSlot(item, 'lg')) {
        itemSlots[item] = prioritySlot;
        usedSlots.add(prioritySlot);
        itemsToAssign.splice(i, 1);
        priorityItemAssigned = true;
        break;
      }
    }
  }

  // Assign remaining house items to available slots
  for (const item of itemsToAssign) {
    let assigned = false;
    for (const slot of shuffledSlots) {
      if (!usedSlots.has(slot.name) && canSpawnInSlot(item, slot.type)) {
        itemSlots[item] = slot.name;
        usedSlots.add(slot.name);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      console.warn(`Could not assign slot for item: ${item}`);
    }
  }

  return {
    itemSlots: itemSlots as Record<ItemName, string>,
    watermelonItem: seed.watermelonItem,
  };
}

// Get position from slot name using GLTF empties
export function getSlotPosition(slotName: string, nodes: any): [number, number, number] | null {
  const empty = nodes[slotName];
  if (empty && empty.position) {
    return [empty.position.x, empty.position.y, empty.position.z];
  }
  console.warn(`Slot ${slotName} not found in GLTF nodes`);
  return null;
}
