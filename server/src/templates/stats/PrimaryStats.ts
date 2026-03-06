/**
 * Primary Stats Definitions
 * 
 * Primary stats are the base stats that define a character's fundamental abilities.
 * These stats directly determine secondary stats through formulas.
 * 
 * Primary Stats:
 * - VIT: Vitality - determines Max HP
 * - ATK: Attack/Strength - determines physical damage
 * - DEF: Defense - determines damage mitigation
 * - DEX: Dexterity - determines speed, evasion, accuracy
 * - MAG: Magic/Intelligence - determines spell damage and Max Mana
 */

import { Unit } from '../../combat/TickCost.js';

// ========== PRIMARY STAT TYPES ==========

export enum PrimaryStatType {
  VIT = 'vit',
  ATK = 'atk',
  DEF = 'def',
  DEX = 'dex',
  MAG = 'mag',
}

// ========== PRIMARY STAT INTERFACE ==========

export interface PrimaryStats {
  vit: number;
  atk: number;
  def: number;
  dex: number;
  mag: number;
}

// ========== BASE STAT VALUES ==========

export const BASE_PRIMARY_STATS: PrimaryStats = {
  vit: 10,   // Base for all characters at Level 1
  atk: 10,   // Base for all characters at Level 1
  def: 10,   // Base for all characters at Level 1
  dex: 10,   // Base for all characters at Level 1
  mag: 10,   // Base for all characters at Level 1
};

// ========== STAT LIMITS ==========

export const PRIMARY_STAT_LIMITS = {
  MIN: 1,
  MAX: 999,
};

// ========== STAT FORMULAS ==========

/**
 * Calculate Max HP from VIT
 * Formula: HP = VIT * 10
 */
export function calculateMaxHp(vit: number): number {
  return vit * 10;
}

/**
 * Calculate Max Mana from MAG
 * Formula: Mana = MAG * 10
 */
export function calculateMaxMana(mag: number): number {
  return mag * 10;
}

/**
 * Calculate tick needed for action based on DEX
 * Formula: tickNeeded = 100 - DEX (min 10)
 */
export function calculateTickNeeded(dex: number): number {
  return Math.max(10, 100 - dex);
}

/**
 * Apply primary stats to a Unit
 */
export function applyPrimaryStatsToUnit(unit: Unit, stats: PrimaryStats): void {
  unit.vit = stats.vit;
  unit.attack = stats.atk;
  unit.defense = stats.def;
  unit.speed = stats.dex;
  unit.magic = stats.mag;
  
  // Derived stats
  unit.maxHp = calculateMaxHp(stats.vit);
  unit.hp = unit.maxHp;
  unit.maxMana = calculateMaxMana(stats.mag);
  unit.mana = unit.maxMana;
}

// ========== STAT BONUS INTERFACE ==========

export interface PrimaryStatBonus {
  vit: number;
  atk: number;
  def: number;
  dex: number;
  mag: number;
}

// ========== FACTORY FUNCTIONS ==========

/**
 * Create empty primary stats
 */
export function createPrimaryStats(): PrimaryStats {
  return { ...BASE_PRIMARY_STATS };
}

/**
 * Create primary stats with overrides
 */
export function createPrimaryStatsWith(
  overrides: Partial<PrimaryStats>
): PrimaryStats {
  return {
    vit: Math.max(PRIMARY_STAT_LIMITS.MIN, overrides.vit ?? BASE_PRIMARY_STATS.vit),
    atk: Math.max(PRIMARY_STAT_LIMITS.MIN, overrides.atk ?? BASE_PRIMARY_STATS.atk),
    def: Math.max(PRIMARY_STAT_LIMITS.MIN, overrides.def ?? BASE_PRIMARY_STATS.def),
    dex: Math.max(PRIMARY_STAT_LIMITS.MIN, overrides.dex ?? BASE_PRIMARY_STATS.dex),
    mag: Math.max(PRIMARY_STAT_LIMITS.MIN, overrides.mag ?? BASE_PRIMARY_STATS.mag),
  };
}

/**
 * Add bonus to primary stats
 */
export function addPrimaryStats(
  base: PrimaryStats,
  bonus: PrimaryStatBonus
): PrimaryStats {
  return {
    vit: Math.min(PRIMARY_STAT_LIMITS.MAX, base.vit + bonus.vit),
    atk: Math.min(PRIMARY_STAT_LIMITS.MAX, base.atk + bonus.atk),
    def: Math.min(PRIMARY_STAT_LIMITS.MAX, base.def + bonus.def),
    dex: Math.min(PRIMARY_STAT_LIMITS.MAX, base.dex + bonus.dex),
    mag: Math.min(PRIMARY_STAT_LIMITS.MAX, base.mag + bonus.mag),
  };
}
