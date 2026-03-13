/**
 * Sample Equipment Items
 * 
 * Registers sample weapons, armor, and accessories for testing.
 */

import { 
  registerEquipment,
  EquipmentItem,
  EquipmentSlot,
  ItemType,
  Rarity,
  ArmorType,
} from './Equipment.js';
import { WeaponType, WeaponCategory, getWeaponStats } from './WeaponTypes.js';

// ========== WEAPONS ==========

export const iron_sword: EquipmentItem = {
  id: 'iron_sword',
  name: 'Iron Sword',
  description: 'A standard iron sword used by novice warriors.',
  type: ItemType.WEAPON,
  rarity: Rarity.COMMON,
  level: 1,
  slot: EquipmentSlot.MAIN_HAND,
  weaponType: WeaponType.SWORD,
  weaponCategory: WeaponCategory.MELEE,
  stats: {
    attack: 5,
    critRate: 2,
  },
  requiredLevel: 1,
  price: 100,
  icon: '⚔️',
  color: '#A0A0A0',
};

export const steel_sword: EquipmentItem = {
  id: 'steel_sword',
  name: 'Steel Sword',
  description: 'A well-crafted steel sword with good balance.',
  type: ItemType.WEAPON,
  rarity: Rarity.UNCOMMON,
  level: 10,
  slot: EquipmentSlot.MAIN_HAND,
  weaponType: WeaponType.SWORD,
  weaponCategory: WeaponCategory.MELEE,
  stats: {
    attack: 12,
    critRate: 5,
    speed: 2,
  },
  requiredLevel: 10,
  price: 500,
  icon: '⚔️',
  color: '#4CAF50',
};

export const mythril_sword: EquipmentItem = {
  id: 'mythril_sword',
  name: 'Mythril Sword',
  description: 'A lightweight sword forged with mythril.',
  type: ItemType.WEAPON,
  rarity: Rarity.RARE,
  level: 25,
  slot: EquipmentSlot.MAIN_HAND,
  weaponType: WeaponType.SWORD,
  weaponCategory: WeaponCategory.MELEE,
  stats: {
    attack: 25,
    critRate: 10,
    speed: 5,
    evasion: 3,
  },
  requiredLevel: 25,
  price: 2500,
  icon: '⚔️',
  color: '#2196F3',
};

export const dragon_slayer: EquipmentItem = {
  id: 'dragon_slayer',
  name: 'Dragon Slayer',
  description: 'A legendary sword forged to slay dragons.',
  type: ItemType.WEAPON,
  rarity: Rarity.LEGENDARY,
  level: 50,
  slot: EquipmentSlot.MAIN_HAND,
  weaponType: WeaponType.GREATSWORD,
  weaponCategory: WeaponCategory.MELEE,
  stats: {
    attack: 80,
    critRate: 15,
    critDamage: 0.3,
    lifeSteal: 10,
    resistance: 10,
  },
  requiredLevel: 50,
  requiredStats: { attack: 50 },
  price: 50000,
  icon: '⚔️',
  color: '#FF5722',
};

export const wooden_staff: EquipmentItem = {
  id: 'wooden_staff',
  name: 'Wooden Staff',
  description: 'A basic staff for aspiring mages.',
  type: ItemType.WEAPON,
  rarity: Rarity.COMMON,
  level: 1,
  slot: EquipmentSlot.MAIN_HAND,
  weaponType: WeaponType.STAFF,
  weaponCategory: WeaponCategory.MAGIC,
  stats: {
    magic: 8,
    maxMana: 20,
    castSpeed: 5,
  },
  requiredLevel: 1,
  price: 100,
  icon: '🪄',
  color: '#8D6E63',
};

export const arcane_staff: EquipmentItem = {
  id: 'arcane_staff',
  name: 'Arcane Staff',
  description: 'A staff imbued with arcane magic.',
  type: ItemType.WEAPON,
  rarity: Rarity.RARE,
  level: 30,
  slot: EquipmentSlot.MAIN_HAND,
  weaponType: WeaponType.STAFF,
  weaponCategory: WeaponCategory.MAGIC,
  stats: {
    magic: 35,
    maxMana: 50,
    spellVamp: 10,
    castSpeed: 15,
  },
  requiredLevel: 30,
  price: 5000,
  icon: '🪄',
  color: '#9C27B0',
};

export const longbow: EquipmentItem = {
  id: 'longbow',
  name: 'Longbow',
  description: 'A tall bow with excellent range.',
  type: ItemType.WEAPON,
  rarity: Rarity.UNCOMMON,
  level: 15,
  slot: EquipmentSlot.MAIN_HAND,
  weaponType: WeaponType.LONGBOW,
  weaponCategory: WeaponCategory.RANGED,
  stats: {
    attack: 18,
    attackRange: 6,
    accuracy: 10,
  },
  requiredLevel: 15,
  price: 1200,
  icon: '🏹',
  color: '#795548',
};

// ========== SHIELDS ==========

export const wooden_shield: EquipmentItem = {
  id: 'wooden_shield',
  name: 'Wooden Shield',
  description: 'A basic wooden shield.',
  type: ItemType.WEAPON,
  rarity: Rarity.COMMON,
  level: 1,
  slot: EquipmentSlot.OFF_HAND,
  weaponType: WeaponType.SHIELD,
  stats: {
    defense: 5,
    block: 5,
  },
  requiredLevel: 1,
  price: 80,
  icon: '🛡️',
  color: '#A1887F',
};

export const iron_shield: EquipmentItem = {
  id: 'iron_shield',
  name: 'Iron Shield',
  description: 'A sturdy iron shield.',
  type: ItemType.WEAPON,
  rarity: Rarity.UNCOMMON,
  level: 10,
  slot: EquipmentSlot.OFF_HAND,
  weaponType: WeaponType.SHIELD,
  stats: {
    defense: 12,
    block: 10,
    vit: 2,
  },
  requiredLevel: 10,
  price: 400,
  icon: '🛡️',
  color: '#607D8B',
};

// ========== ARMOR ==========

export const leather_helmet: EquipmentItem = {
  id: 'leather_helmet',
  name: 'Leather Helmet',
  description: 'A basic leather helmet.',
  type: ItemType.ARMOR,
  rarity: Rarity.COMMON,
  level: 1,
  slot: EquipmentSlot.HEAD,
  armorType: ArmorType.HEAD,
  stats: {
    defense: 2,
    evasion: 1,
  },
  requiredLevel: 1,
  price: 50,
  icon: '⛑️',
  color: '#8D6E63',
};

export const iron_helmet: EquipmentItem = {
  id: 'iron_helmet',
  name: 'Iron Helmet',
  description: 'A sturdy iron helmet.',
  type: ItemType.ARMOR,
  rarity: Rarity.UNCOMMON,
  level: 10,
  slot: EquipmentSlot.HEAD,
  armorType: ArmorType.HEAD,
  stats: {
    defense: 8,
    vit: 3,
  },
  requiredLevel: 10,
  price: 300,
  icon: '⛑️',
  color: '#78909C',
};

export const leather_armor: EquipmentItem = {
  id: 'leather_armor',
  name: 'Leather Armor',
  description: 'Light leather armor for agile fighters.',
  type: ItemType.ARMOR,
  rarity: Rarity.COMMON,
  level: 1,
  slot: EquipmentSlot.BODY,
  armorType: ArmorType.BODY,
  stats: {
    defense: 4,
    evasion: 3,
    speed: 1,
  },
  requiredLevel: 1,
  price: 80,
  icon: '👕',
  color: '#8D6E63',
};

export const chainmail: EquipmentItem = {
  id: 'chainmail',
  name: 'Chainmail',
  description: 'Interlocking metal rings provide solid protection.',
  type: ItemType.ARMOR,
  rarity: Rarity.UNCOMMON,
  level: 15,
  slot: EquipmentSlot.BODY,
  armorType: ArmorType.BODY,
  stats: {
    defense: 15,
    resistance: 5,
    vit: 5,
  },
  requiredLevel: 15,
  price: 800,
  icon: '👕',
  color: '#546E7A',
};

export const plate_armor: EquipmentItem = {
  id: 'plate_armor',
  name: 'Plate Armor',
  description: 'Heavy plate armor for maximum protection.',
  type: ItemType.ARMOR,
  rarity: Rarity.RARE,
  level: 30,
  slot: EquipmentSlot.BODY,
  armorType: ArmorType.BODY,
  stats: {
    defense: 30,
    damageReduction: 5,
    vit: 10,
    speed: -5,
  },
  requiredLevel: 30,
  price: 5000,
  icon: '🛡️',
  color: '#455A64',
};

export const dragon_scale_armor: EquipmentItem = {
  id: 'dragon_scale_armor',
  name: 'Dragon Scale Armor',
  description: 'Armor crafted from dragon scales.',
  type: ItemType.ARMOR,
  rarity: Rarity.LEGENDARY,
  level: 50,
  slot: EquipmentSlot.BODY,
  armorType: ArmorType.BODY,
  stats: {
    defense: 60,
    damageReduction: 15,
    resistance: 20,
    vit: 20,
    fireResistance: 30,
  },
  requiredLevel: 50,
  requiredStats: { defense: 40 },
  price: 100000,
  icon: '🐉',
  color: '#BF360C',
};

// ========== ACCESSORIES ==========

export const ring_of_health: EquipmentItem = {
  id: 'ring_of_health',
  name: 'Ring of Health',
  description: 'A simple ring that boosts vitality.',
  type: ItemType.ACCESSORY,
  rarity: Rarity.COMMON,
  level: 1,
  slot: EquipmentSlot.ACCESSORY_1,
  stats: {
    vit: 5,
    maxHp: 25,
  },
  requiredLevel: 1,
  price: 100,
  icon: '💍',
  color: '#EF5350',
};

export const ring_of_power: EquipmentItem = {
  id: 'ring_of_power',
  name: 'Ring of Power',
  description: 'A ring that enhances attack power.',
  type: ItemType.ACCESSORY,
  rarity: Rarity.UNCOMMON,
  level: 10,
  slot: EquipmentSlot.ACCESSORY_1,
  stats: {
    attack: 8,
    critRate: 3,
  },
  requiredLevel: 10,
  price: 500,
  icon: '💍',
  color: '#FFA726',
};

export const amulet_of_wisdom: EquipmentItem = {
  id: 'amulet_of_wisdom',
  name: 'Amulet of Wisdom',
  description: 'An amulet that enhances magical abilities.',
  type: ItemType.ACCESSORY,
  rarity: Rarity.RARE,
  level: 25,
  slot: EquipmentSlot.ACCESSORY_1,
  stats: {
    magic: 15,
    maxMana: 75,
    spellVamp: 5,
  },
  requiredLevel: 25,
  price: 3000,
  icon: '📿',
  color: '#AB47BC',
};

export const boots_of_speed: EquipmentItem = {
  id: 'boots_of_speed',
  name: 'Boots of Speed',
  description: 'Enchanted boots that increase movement speed.',
  type: ItemType.ARMOR,
  rarity: Rarity.UNCOMMON,
  level: 15,
  slot: EquipmentSlot.FEET,
  armorType: ArmorType.FEET,
  stats: {
    speed: 10,
    evasion: 5,
  },
  requiredLevel: 15,
  price: 1500,
  icon: '👢',
  color: '#42A5F5',
};

// ========== REGISTER ALL ITEMS ==========

export function registerAllEquipment(): void {
  // Weapons
  registerEquipment(iron_sword);
  registerEquipment(steel_sword);
  registerEquipment(mythril_sword);
  registerEquipment(dragon_slayer);
  registerEquipment(wooden_staff);
  registerEquipment(arcane_staff);
  registerEquipment(longbow);
  
  // Shields
  registerEquipment(wooden_shield);
  registerEquipment(iron_shield);
  
  // Armor
  registerEquipment(leather_helmet);
  registerEquipment(iron_helmet);
  registerEquipment(leather_armor);
  registerEquipment(chainmail);
  registerEquipment(plate_armor);
  registerEquipment(dragon_scale_armor);
  
  // Accessories
  registerEquipment(ring_of_health);
  registerEquipment(ring_of_power);
  registerEquipment(amulet_of_wisdom);
  
  // Feet
  registerEquipment(boots_of_speed);
}

// Auto-register on import
registerAllEquipment();
