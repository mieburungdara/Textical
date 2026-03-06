/**
 * Weapon Types
 * 
 * Defines weapon types and their grid-based combat stats.
 * Attack range and movement are determined by the weapon equipped.
 * This system applies to both players and monsters.
 */

import { GridStats, DEFAULT_GRID_STATS, createGridStats, GRID_STAT_LIMITS } from '../stats/GridStats.js';

// ========== WEAPON TYPE ENUM ==========

export enum WeaponType {
  // Melee Weapons
  FIST = 'fist',              // Bare hands
  SWORD = 'sword',            // Balanced sword
  DAGGER = 'dagger',          // Fast, high evasion
  AXE = 'axe',                // High damage, slow
  POLEARM = 'polearm',        // Long reach
  HAMMER = 'hammer',          // Heavy, high defense ignore
  STAFF = 'staff',            // Magic focus
  SHIELD = 'shield',          // Defense only
  
  // Ranged Weapons
  BOW = 'bow',                // Long range, mobile
  CROSSBOW = 'crossbow',      // High damage, slow reload
  THROWING = 'throwing',      // Medium range, fast
  WAND = 'wand',              // Magic focus
  
  // Two-Handed
  GREATSWORD = 'greatsword', // High damage, slow
  GREATAXE = 'greataxe',     // High damage, slow
  LONGBOW = 'longbow',       // Very long range
  CLUB = 'club',             // Simple weapon
}

// ========== WEAPON CATEGORY ==========

export enum WeaponCategory {
  MELEE = 'melee',
  RANGED = 'ranged',
  MAGIC = 'magic',
  SHIELD = 'shield',
}

export const WEAPON_CATEGORIES: Record<WeaponType, WeaponCategory> = {
  [WeaponType.FIST]: WeaponCategory.MELEE,
  [WeaponType.SWORD]: WeaponCategory.MELEE,
  [WeaponType.DAGGER]: WeaponCategory.MELEE,
  [WeaponType.AXE]: WeaponCategory.MELEE,
  [WeaponType.POLEARM]: WeaponCategory.MELEE,
  [WeaponType.HAMMER]: WeaponCategory.MELEE,
  [WeaponType.STAFF]: WeaponCategory.MAGIC,
  [WeaponType.SHIELD]: WeaponCategory.SHIELD,
  [WeaponType.BOW]: WeaponCategory.RANGED,
  [WeaponType.CROSSBOW]: WeaponCategory.RANGED,
  [WeaponType.THROWING]: WeaponCategory.RANGED,
  [WeaponType.WAND]: WeaponCategory.MAGIC,
  [WeaponType.GREATSWORD]: WeaponCategory.MELEE,
  [WeaponType.GREATAXE]: WeaponCategory.MELEE,
  [WeaponType.LONGBOW]: WeaponCategory.RANGED,
  [WeaponType.CLUB]: WeaponCategory.MELEE,
};

// ========== WEAPON STATS ==========

export interface WeaponStats {
  // Grid combat stats
  attackRange: number;    // Tiles
  moveRange: number;      // Tiles per move
  minRange: number;       // Minimum range (for ranged weapons)
  
  // Combat bonuses
  attackBonus: number;     // Flat attack bonus
  defenseBonus: number;   // Flat defense bonus
  critRateBonus: number;  // Critical rate bonus
  evasionBonus: number;   // Evasion bonus
  speedBonus: number;     // Action speed bonus
  
  // Description
  description: string;
}

// ========== WEAPON STATS TABLE ==========

export const WEAPON_STATS: Record<WeaponType, WeaponStats> = {
  // ========== MELEE WEAPONS ==========
  [WeaponType.FIST]: {
    attackRange: 1,
    moveRange: 3,
    minRange: 0,
    attackBonus: 0,
    defenseBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0,
    speedBonus: 0,
    description: 'Bare fists - no weapon equipped',
  },
  
  [WeaponType.SWORD]: {
    attackRange: 1,
    moveRange: 3,
    minRange: 0,
    attackBonus: 5,
    defenseBonus: 2,
    critRateBonus: 2,
    evasionBonus: 0,
    speedBonus: 0,
    description: 'Balanced blade for versatile combat',
  },
  
  [WeaponType.DAGGER]: {
    attackRange: 1,
    moveRange: 4,
    minRange: 0,
    attackBonus: 3,
    defenseBonus: -1,
    critRateBonus: 5,
    evasionBonus: 3,
    speedBonus: 1,
    description: 'Fast strikes with high critical chance',
  },
  
  [WeaponType.AXE]: {
    attackRange: 1,
    moveRange: 3,
    minRange: 0,
    attackBonus: 8,
    defenseBonus: 0,
    critRateBonus: 3,
    evasionBonus: -1,
    speedBonus: -1,
    description: 'Heavy axe with devastating power',
  },
  
  [WeaponType.POLEARM]: {
    attackRange: 2,
    moveRange: 3,
    minRange: 0,
    attackBonus: 6,
    defenseBonus: 1,
    critRateBonus: 1,
    evasionBonus: -1,
    speedBonus: 0,
    description: 'Long reach weapon for keeping distance',
  },
  
  [WeaponType.HAMMER]: {
    attackRange: 1,
    moveRange: 2,
    minRange: 0,
    attackBonus: 10,
    defenseBonus: 2,
    critRateBonus: 0,
    evasionBonus: -2,
    speedBonus: -2,
    description: 'Crushing blow that ignores defense',
  },
  
  [WeaponType.STAFF]: {
    attackRange: 3,
    moveRange: 3,
    minRange: 0,
    attackBonus: 2,
    defenseBonus: -2,
    critRateBonus: 2,
    evasionBonus: 0,
    speedBonus: 0,
    description: 'Magic focus with moderate range',
  },
  
  [WeaponType.SHIELD]: {
    attackRange: 1,
    moveRange: 2,
    minRange: 0,
    attackBonus: 0,
    defenseBonus: 8,
    critRateBonus: 0,
    evasionBonus: -2,
    speedBonus: 0,
    description: 'Pure defense - no attack capability',
  },
  
  // ========== RANGED WEAPONS ==========
  [WeaponType.BOW]: {
    attackRange: 5,
    moveRange: 4,
    minRange: 2,
    attackBonus: 4,
    defenseBonus: -1,
    critRateBonus: 3,
    evasionBonus: 2,
    speedBonus: 1,
    description: 'Classic bow for mobile ranged combat',
  },
  
  [WeaponType.CROSSBOW]: {
    attackRange: 4,
    moveRange: 2,
    minRange: 2,
    attackBonus: 7,
    defenseBonus: 0,
    critRateBonus: 5,
    evasionBonus: 0,
    speedBonus: -1,
    description: 'Powerful but slow to reload',
  },
  
  [WeaponType.THROWING]: {
    attackRange: 3,
    moveRange: 4,
    minRange: 1,
    attackBonus: 3,
    defenseBonus: 0,
    critRateBonus: 2,
    evasionBonus: 1,
    speedBonus: 1,
    description: 'Quick throws with medium range',
  },
  
  [WeaponType.WAND]: {
    attackRange: 3,
    moveRange: 3,
    minRange: 0,
    attackBonus: 1,
    defenseBonus: -2,
    critRateBonus: 3,
    evasionBonus: 1,
    speedBonus: 1,
    description: 'Magic channeling with quick casts',
  },
  
  // ========== TWO-HANDED WEAPONS ==========
  [WeaponType.GREATSWORD]: {
    attackRange: 1,
    moveRange: 2,
    minRange: 0,
    attackBonus: 12,
    defenseBonus: 1,
    critRateBonus: 3,
    evasionBonus: -3,
    speedBonus: -2,
    description: 'Massive blade with overwhelming power',
  },
  
  [WeaponType.GREATAXE]: {
    attackRange: 1,
    moveRange: 2,
    minRange: 0,
    attackBonus: 14,
    defenseBonus: 0,
    critRateBonus: 4,
    evasionBonus: -3,
    speedBonus: -2,
    description: 'Devastating axe swing',
  },
  
  [WeaponType.LONGBOW]: {
    attackRange: 6,
    moveRange: 3,
    minRange: 3,
    attackBonus: 6,
    defenseBonus: -1,
    critRateBonus: 4,
    evasionBonus: 0,
    speedBonus: 0,
    description: 'Extended range for sniping',
  },
  
  [WeaponType.CLUB]: {
    attackRange: 1,
    moveRange: 3,
    minRange: 0,
    attackBonus: 2,
    defenseBonus: 1,
    critRateBonus: 0,
    evasionBonus: 0,
    speedBonus: 1,
    description: 'Simple wooden club',
  },
};

// ========== FACTORY FUNCTIONS ==========

/**
 * Get weapon stats by weapon type
 */
export function getWeaponStats(weaponType: WeaponType): WeaponStats {
  return WEAPON_STATS[weaponType] ?? WEAPON_STATS[WeaponType.FIST];
}

/**
 * Get grid stats from weapon
 */
export function getWeaponGridStats(weaponType: WeaponType): GridStats {
  const stats = getWeaponStats(weaponType);
  return createGridStats(stats.attackRange, stats.moveRange, stats.minRange);
}

/**
 * Check if weapon is ranged
 */
export function isRangedWeapon(weaponType: WeaponType): boolean {
  return WEAPON_CATEGORIES[weaponType] === WeaponCategory.RANGED;
}

/**
 * Check if weapon is magic
 */
export function isMagicWeapon(weaponType: WeaponType): boolean {
  return WEAPON_CATEGORIES[weaponType] === WeaponCategory.MAGIC;
}

/**
 * Check if weapon can attack
 */
export function canAttack(weaponType: WeaponType): boolean {
  return weaponType !== WeaponType.SHIELD;
}

// ========== MONSTER WEAPON TEMPLATES ==========
// Pre-defined weapon sets for common monster types

export interface MonsterWeaponSet {
  name: string;
  weapons: WeaponType[];
  description: string;
}

export const MONSTER_WEAPON_SETS: Record<string, MonsterWeaponSet> = {
  // Unarmed
  unarmed: {
    name: 'Unarmed',
    weapons: [WeaponType.FIST],
    description: 'No weapons - uses natural attacks',
  },
  
  // Skeleton variants
  skeleton_warrior: {
    name: 'Skeleton Warrior',
    weapons: [WeaponType.SWORD, WeaponType.SHIELD],
    description: 'Sword and shield',
  },
  skeleton_archer: {
    name: 'Skeleton Archer',
    weapons: [WeaponType.BOW],
    description: 'Bow for ranged attacks',
  },
  skeleton_mage: {
    name: 'Skeleton Mage',
    weapons: [WeaponType.STAFF],
    description: 'Staff for magic',
  },
  skeleton_knight: {
    name: 'Skeleton Knight',
    weapons: [WeaponType.POLEARM, WeaponType.SHIELD],
    description: 'Polearm and shield',
  },
  
  // Goblin variants
  goblin_warrior: {
    name: 'Goblin Warrior',
    weapons: [WeaponType.AXE],
    description: 'Dual axes',
  },
  goblin_archer: {
    name: 'Goblin Archer',
    weapons: [WeaponType.BOW],
    description: 'Bow for ranged attacks',
  },
  
  // Orc variants
  orc_warrior: {
    name: 'Orc Warrior',
    weapons: [WeaponType.GREATAXE],
    description: 'Massive two-handed axe',
  },
  orc_shaman: {
    name: 'Orc Shaman',
    weapons: [WeaponType.STAFF],
    description: 'Staff for dark magic',
  },
  
  // Dragon variants (natural weapons are claws/teeth)
  dragon_melee: {
    name: 'Dragon Melee',
    weapons: [WeaponType.FIST],  // Claws
    description: 'Natural claws and teeth (melee)',
  },
  dragon_mage: {
    name: 'Dragon Mage',
    weapons: [WeaponType.STAFF],
    description: 'Uses magical breath and staff',
  },
  
  // Human bandit variants
  bandit: {
    name: 'Bandit',
    weapons: [WeaponType.DAGGER],
    description: 'Dagger for quick attacks',
  },
  bandit_archer: {
    name: 'Bandit Archer',
    weapons: [WeaponType.BOW],
    description: 'Bow for ranged attacks',
  },
  bandit_leader: {
    name: 'Bandit Leader',
    weapons: [WeaponType.SWORD, WeaponType.SHIELD],
    description: 'Sword and shield',
  },
};

/**
 * Get weapon set for monster template
 */
export function getMonsterWeaponSet(templateId: string): WeaponType[] {
  // Try exact match first
  if (MONSTER_WEAPON_SETS[templateId]) {
    return MONSTER_WEAPON_SETS[templateId].weapons;
  }
  
  // Try partial match
  for (const [key, weaponSet] of Object.entries(MONSTER_WEAPON_SETS)) {
    if (templateId.includes(key)) {
      return weaponSet.weapons;
    }
  }
  
  // Default to unarmed
  return [WeaponType.FIST];
}
