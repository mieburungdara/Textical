/**
 * Equipment System
 * 
 * Manages equipment slots, inventory, and stat bonuses from equipment.
 * Equipment provides:
 * - Stat bonuses (attack, defense, etc.)
 * - Grid combat stats (range, movement)
 * - Special effects (life steal, spell vamp, etc.)
 */

import { Unit } from '../../combat/TickCost.js';
import { WeaponType, getWeaponStats, WeaponCategory } from './WeaponTypes.js';

// ========== EQUIPMENT SLOTS ==========

export enum EquipmentSlot {
  MAIN_HAND = 'main_hand',
  OFF_HAND = 'off_hand',
  HEAD = 'head',
  BODY = 'body',
  FEET = 'feet',
  ACCESSORY_1 = 'accessory_1',
  ACCESSORY_2 = 'accessory_2',
}

export const EQUIPMENT_SLOTS = [
  EquipmentSlot.MAIN_HAND,
  EquipmentSlot.OFF_HAND,
  EquipmentSlot.HEAD,
  EquipmentSlot.BODY,
  EquipmentSlot.FEET,
  EquipmentSlot.ACCESSORY_1,
  EquipmentSlot.ACCESSORY_2,
];

// ========== ITEM TYPES ==========

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
}

export enum ArmorType {
  HEAD = 'head',
  BODY = 'body',
  FEET = 'feet',
}

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export const RARITY_MULTIPLIER: Record<Rarity, number> = {
  [Rarity.COMMON]: 1.0,
  [Rarity.UNCOMMON]: 1.25,
  [Rarity.RARE]: 1.5,
  [Rarity.EPIC]: 2.0,
  [Rarity.LEGENDARY]: 3.0,
};

// ========== STAT BONUSES INTERFACE ==========

export interface StatBonus {
  stat: string;
  value: number;
  isPercentage?: boolean;
}

export interface EquipmentStats {
  // Primary stats
  vit?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  magic?: number;
  
  // Secondary stats
  critRate?: number;
  critDamage?: number;
  evasion?: number;
  accuracy?: number;
  block?: number;
  resistance?: number;
  damageReduction?: number;
  statusResistance?: number;
  tenacity?: number;
  lifeSteal?: number;
  spellVamp?: number;
  attackSpeed?: number;
  castSpeed?: number;
  
  // Elemental resistances
  fireResistance?: number;
  waterResistance?: number;
  earthResistance?: number;
  windResistance?: number;
  lightResistance?: number;
  darkResistance?: number;
  
  // HP/Mana
  maxHp?: number;
  maxMana?: number;
  
  // Grid stats (for weapons)
  attackRange?: number;
  moveRange?: number;
  minRange?: number;
}

// ========== EQUIPMENT ITEM INTERFACE ==========

export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: Rarity;
  level: number;
  
  // Equipment slot this item goes into
  slot: EquipmentSlot;
  
  // Weapon type (if weapon)
  weaponType?: WeaponType;
  weaponCategory?: WeaponCategory;
  
  // Armor type (if armor)
  armorType?: ArmorType;
  
  // Stat bonuses from this equipment
  stats: EquipmentStats;
  
  // Requirements
  requiredLevel: number;
  requiredStats?: {
    vit?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    magic?: number;
  };
  
  // Value
  price: number;
  
  // Visual
  icon: string;
  color: string;
}

// ========== CONSUMABLE ITEM INTERFACE ==========

export enum ConsumableType {
  HEALTH_POTION = 'health_potion',
  MANA_POTION = 'mana_potion',
  ANTIDOTE = 'antidote',
  BUFF_ITEM = 'buff_item',
}

export interface ConsumableEffect {
  // Heal effects
  healHp?: number;
  healHpPercent?: number;
  healMana?: number;
  healManaPercent?: number;
  
  // Buff effects
  buff?: {
    stat: string;
    value: number;
    duration: number;
  };
  
  // Status removal
  removeStatus?: string[];
  
  // Combat-only usage
  usableInCombat?: boolean;
}

export interface ConsumableItem {
  id: string;
  name: string;
  description: string;
  type: ItemType.CONSUMABLE;
  rarity: Rarity;
  level: number;
  
  // Consumable type
  consumableType: ConsumableType;
  
  // Effect when used
  effect: ConsumableEffect;
  
  // Stack info
  maxStack: number;
  
  // Value
  price: number;
  
  // Visual
  icon: string;
  color: string;
}

// ========== CONSUMABLE REGISTRY ==========

export const CONSUMABLE_REGISTRY: Record<string, ConsumableItem> = {};

/**
 * Register a consumable item
 */
export function registerConsumable(item: ConsumableItem): void {
  CONSUMABLE_REGISTRY[item.id] = item;
}

/**
 * Get consumable by ID
 */
export function getConsumable(id: string): ConsumableItem | undefined {
  return CONSUMABLE_REGISTRY[id];
}

/**
 * Get all consumables
 */
export function getAllConsumables(): ConsumableItem[] {
  return Object.values(CONSUMABLE_REGISTRY);
}

// ========== INVENTORY INTERFACE ==========

export interface InventorySlot {
  index: number;
  item: EquipmentItem | null;
  quantity: number;
}

export interface PlayerInventory {
  playerId: string;
  slots: (InventorySlot | null)[];
  maxSlots: number;
  gold: number;
}

export interface PlayerEquipment {
  playerId: string;
  [EquipmentSlot.MAIN_HAND]: EquipmentItem | null;
  [EquipmentSlot.OFF_HAND]: EquipmentItem | null;
  [EquipmentSlot.HEAD]: EquipmentItem | null;
  [EquipmentSlot.BODY]: EquipmentItem | null;
  [EquipmentSlot.FEET]: EquipmentItem | null;
  [EquipmentSlot.ACCESSORY_1]: EquipmentItem | null;
  [EquipmentSlot.ACCESSORY_2]: EquipmentItem | null;
}

// ========== REGISTRY ==========

export const EQUIPMENT_REGISTRY: Record<string, EquipmentItem> = {};

/**
 * Register an equipment item
 */
export function registerEquipment(item: EquipmentItem): void {
  EQUIPMENT_REGISTRY[item.id] = item;
}

/**
 * Get equipment by ID
 */
export function getEquipment(id: string): EquipmentItem | undefined {
  return EQUIPMENT_REGISTRY[id];
}

/**
 * Get all equipment of a specific slot
 */
export function getEquipmentBySlot(slot: EquipmentSlot): EquipmentItem[] {
  return Object.values(EQUIPMENT_REGISTRY).filter(e => e.slot === slot);
}

/**
 * Get all equipment
 */
export function getAllEquipment(): EquipmentItem[] {
  return Object.values(EQUIPMENT_REGISTRY);
}

// ========== INVENTORY MANAGEMENT ==========

/**
 * Create a new inventory
 */
export function createInventory(playerId: string, maxSlots: number = 50): PlayerInventory {
  const slots: (InventorySlot | null)[] = [];
  for (let i = 0; i < maxSlots; i++) {
    slots.push(null);
  }
  
  return {
    playerId,
    slots,
    maxSlots,
    gold: 0,
  };
}

/**
 * Add item to inventory
 */
export function addItemToInventory(
  inventory: PlayerInventory,
  item: EquipmentItem,
  quantity: number = 1
): { success: boolean; slotIndex: number } {
  // Check if item already exists (for stackable items)
  const existingSlot = inventory.slots.findIndex(
    slot => slot?.item?.id === item.id && slot.quantity < 99
  );
  
  if (existingSlot >= 0) {
    const slot = inventory.slots[existingSlot]!;
    const maxStack = 99;
    const spaceAvailable = maxStack - slot.quantity;
    const toAdd = Math.min(spaceAvailable, quantity);
    
    slot.quantity += toAdd;
    
    return { success: true, slotIndex: existingSlot };
  }
  
  // Find empty slot
  const emptySlot = inventory.slots.findIndex(slot => slot === null);
  
  if (emptySlot >= 0) {
    inventory.slots[emptySlot] = {
      index: emptySlot,
      item,
      quantity,
    };
    
    return { success: true, slotIndex: emptySlot };
  }
  
  // Inventory full
  return { success: false, slotIndex: -1 };
}

/**
 * Remove item from inventory
 */
export function removeItemFromInventory(
  inventory: PlayerInventory,
  slotIndex: number,
  quantity: number = 1
): { success: boolean; item: EquipmentItem | null } {
  const slot = inventory.slots[slotIndex];
  
  if (!slot || !slot.item) {
    return { success: false, item: null };
  }
  
  if (slot.quantity <= quantity) {
    inventory.slots[slotIndex] = null;
    return { success: true, item: slot.item };
  }
  
  slot.quantity -= quantity;
  return { success: true, item: slot.item };
}

/**
 * Get item at slot
 */
export function getItemAtSlot(inventory: PlayerInventory, slotIndex: number): EquipmentItem | null {
  return inventory.slots[slotIndex]?.item ?? null;
}

/**
 * Get inventory item count
 */
export function getInventoryItemCount(inventory: PlayerInventory, itemId: string): number {
  return inventory.slots.reduce((count, slot) => {
    if (slot?.item?.id === itemId) {
      return count + slot.quantity;
    }
    return count;
  }, 0);
}

// ========== EQUIPMENT MANAGEMENT ==========

/**
 * Create empty equipment
 */
export function createPlayerEquipment(playerId: string): PlayerEquipment {
  return {
    playerId,
    [EquipmentSlot.MAIN_HAND]: null,
    [EquipmentSlot.OFF_HAND]: null,
    [EquipmentSlot.HEAD]: null,
    [EquipmentSlot.BODY]: null,
    [EquipmentSlot.FEET]: null,
    [EquipmentSlot.ACCESSORY_1]: null,
    [EquipmentSlot.ACCESSORY_2]: null,
  };
}

/**
 * Equip an item
 */
export function equipItem(
  equipment: PlayerEquipment,
  inventory: PlayerInventory,
  slotIndex: number
): { success: boolean; unequippedItem: EquipmentItem | null; message: string } {
  const slot = inventory.slots[slotIndex];
  
  if (!slot || !slot.item) {
    return { success: false, unequippedItem: null, message: 'No item in slot' };
  }
  
  const item = slot.item;
  
  // Check level requirement
  // Note: We need to get the player's actual level - this would need to be passed in
  // For now, we'll skip this check or it can be added later
  
  // Check slot compatibility
  const targetSlot = item.slot;
  
  // Get current equipped item
  const currentEquipped = equipment[targetSlot];
  
  // Check if two-handed weapon and off-hand is occupied
  if (item.weaponCategory === WeaponCategory.MELEE || 
      item.weaponCategory === WeaponCategory.RANGED ||
      item.weaponType === WeaponType.GREATSWORD ||
      item.weaponType === WeaponType.GREATAXE ||
      item.weaponType === WeaponType.LONGBOW ||
      item.weaponType === WeaponType.STAFF) {
    if (equipment[EquipmentSlot.OFF_HAND] !== null) {
      return { 
        success: false, 
        unequippedItem: null, 
        message: 'Cannot equip two-handed weapon while off-hand is occupied' 
      };
    }
  }
  
  // Equip the item
  equipment[targetSlot] = item;
  
  // Remove from inventory
  inventory.slots[slotIndex] = null;
  
  // If there was an equipped item, add it back to inventory
  if (currentEquipped) {
    addItemToInventory(inventory, currentEquipped, 1);
  }
  
  return { 
    success: true, 
    unequippedItem: currentEquipped, 
    message: `Equipped ${item.name}` 
  };
}

/**
 * Unequip an item
 */
export function unequipItem(
  equipment: PlayerEquipment,
  inventory: PlayerInventory,
  slot: EquipmentSlot
): { success: boolean; item: EquipmentItem | null; message: string } {
  const equippedItem = equipment[slot];
  
  if (!equippedItem) {
    return { success: false, item: null, message: 'No item equipped' };
  }
  
  // Try to add to inventory
  const addResult = addItemToInventory(inventory, equippedItem, 1);
  
  if (!addResult.success) {
    return { success: false, item: null, message: 'Inventory full' };
  }
  
  // Remove from equipment
  equipment[slot] = null;
  
  return { 
    success: true, 
    item: equippedItem, 
    message: `Unequipped ${equippedItem.name}` 
  };
}

// ========== STAT CALCULATION ==========

/**
 * Calculate total stat bonuses from equipment
 */
export function calculateEquipmentStats(equipment: PlayerEquipment): EquipmentStats {
  const totalStats: EquipmentStats = {};
  
  for (const slot of EQUIPMENT_SLOTS) {
    const item = equipment[slot];
    if (!item) continue;
    
    // Add all stats from this item
    for (const [key, value] of Object.entries(item.stats)) {
      if (value !== undefined) {
        const statKey = key as keyof EquipmentStats;
        if (typeof totalStats[statKey] === 'number' && typeof value === 'number') {
          (totalStats as any)[statKey] = (totalStats as any)[statKey] + value;
        } else {
          (totalStats as any)[statKey] = value;
        }
      }
    }
  }
  
  return totalStats;
}

/**
 * Apply equipment stats to a unit
 */
export function applyEquipmentStats(unit: Unit, equipment: PlayerEquipment): Unit {
  const bonusStats = calculateEquipmentStats(equipment);
  
  const modifiedUnit = { ...unit };
  
  // Apply stat bonuses
  if (bonusStats.vit) modifiedUnit.maxHp += bonusStats.vit * 10;
  if (bonusStats.maxHp) modifiedUnit.maxHp += bonusStats.maxHp;
  if (bonusStats.maxMana) modifiedUnit.maxMana += bonusStats.maxMana;
  if (bonusStats.attack) modifiedUnit.attack += bonusStats.attack;
  if (bonusStats.defense) modifiedUnit.defense += bonusStats.defense;
  if (bonusStats.speed) modifiedUnit.speed += bonusStats.speed;
  if (bonusStats.magic) modifiedUnit.magic += bonusStats.magic;
  
  // Apply secondary stat bonuses
  if (bonusStats.critRate) modifiedUnit.critRate = Math.min(50, modifiedUnit.critRate + bonusStats.critRate);
  if (bonusStats.critDamage) modifiedUnit.critDamage += bonusStats.critDamage;
  if (bonusStats.evasion) modifiedUnit.evasion = Math.min(40, modifiedUnit.evasion + bonusStats.evasion);
  if (bonusStats.accuracy) modifiedUnit.accuracy = Math.min(100, modifiedUnit.accuracy + bonusStats.accuracy);
  if (bonusStats.block) modifiedUnit.block = Math.min(30, modifiedUnit.block + bonusStats.block);
  if (bonusStats.resistance) modifiedUnit.resistance = Math.min(50, modifiedUnit.resistance + bonusStats.resistance);
  if (bonusStats.damageReduction) modifiedUnit.damageReduction = Math.min(75, modifiedUnit.damageReduction + bonusStats.damageReduction);
  if (bonusStats.statusResistance) modifiedUnit.statusResistance = Math.min(50, modifiedUnit.statusResistance + bonusStats.statusResistance);
  if (bonusStats.tenacity) modifiedUnit.tenacity = Math.min(50, modifiedUnit.tenacity + bonusStats.tenacity);
  if (bonusStats.lifeSteal) modifiedUnit.lifeSteal = Math.min(50, modifiedUnit.lifeSteal + bonusStats.lifeSteal);
  if (bonusStats.spellVamp) modifiedUnit.spellVamp = Math.min(50, modifiedUnit.spellVamp + bonusStats.spellVamp);
  if (bonusStats.attackSpeed) modifiedUnit.attackSpeed = Math.max(0.5, Math.min(3.0, modifiedUnit.attackSpeed + bonusStats.attackSpeed / 100));
  if (bonusStats.castSpeed) modifiedUnit.castSpeed = Math.min(200, modifiedUnit.castSpeed + bonusStats.castSpeed);
  
  // Apply grid stats from main hand weapon
  const mainHand = equipment[EquipmentSlot.MAIN_HAND];
  if (mainHand?.weaponType) {
    const weaponStats = getWeaponStats(mainHand.weaponType);
    if (weaponStats) {
      modifiedUnit.attackRange = weaponStats.attackRange;
      modifiedUnit.moveRange = weaponStats.moveRange;
      modifiedUnit.minRange = weaponStats.minRange;
      modifiedUnit.attack += weaponStats.attackBonus;
      modifiedUnit.defense += weaponStats.defenseBonus;
      modifiedUnit.critRate = Math.min(50, modifiedUnit.critRate + weaponStats.critRateBonus);
      modifiedUnit.evasion = Math.min(40, modifiedUnit.evasion + weaponStats.evasionBonus);
      modifiedUnit.speed += weaponStats.speedBonus;
    }
  }
  
  // Apply off-hand shield bonus
  const offHand = equipment[EquipmentSlot.OFF_HAND];
  if (offHand?.weaponType === WeaponType.SHIELD) {
    const shieldStats = getWeaponStats(WeaponType.SHIELD);
    if (shieldStats) {
      modifiedUnit.block = Math.min(30, modifiedUnit.block + shieldStats.defenseBonus);
      modifiedUnit.defense += shieldStats.defenseBonus;
    }
  }
  
  // Sync current HP/Mana to new max
  if (modifiedUnit.maxHp > unit.maxHp) {
    modifiedUnit.hp = Math.min(modifiedUnit.hp, modifiedUnit.maxHp);
  }
  if (modifiedUnit.maxMana > unit.maxMana) {
    modifiedUnit.mana = Math.min(modifiedUnit.mana, modifiedUnit.maxMana);
  }
  
  return modifiedUnit;
}

/**
 * Get equipment summary for UI
 */
export function getEquipmentSummary(equipment: PlayerEquipment): Record<EquipmentSlot, string> {
  const summary: Record<string, string> = {};
  
  for (const slot of EQUIPMENT_SLOTS) {
    const item = equipment[slot];
    summary[slot] = item ? `${item.name} (${item.rarity})` : 'Empty';
  }
  
  return summary as Record<EquipmentSlot, string>;
}
