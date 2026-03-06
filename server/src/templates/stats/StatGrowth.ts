/**
 * Stat Growth System
 * 
 * Defines how stats increase with level.
 * Each class has different growth rates for primary stats.
 * 
 * Growth Types:
 * - Primary Growth: Direct increase to primary stats per level
 * - Secondary Growth: Increase to derived stats per level
 */

import { Unit } from '../../combat/TickCost.js';
import { PrimaryStats, createPrimaryStats } from './PrimaryStats.js';
import { SecondaryStats, createSecondaryStats, SecondaryStatBonus } from './SecondaryStats.js';

// ========== PRIMARY GROWTH ==========

export interface PrimaryGrowth {
  vit: number;    // VIT per level
  atk: number;    // ATK per level
  def: number;    // DEF per level
  dex: number;    // DEX per level
  mag: number;    // MAG per level
}

// ========== SECONDARY GROWTH ==========

export interface SecondaryGrowth {
  hpBonus?: number;    // Additional HP per level (beyond VIT*10)
  manaBonus?: number;  // Additional Mana per level (beyond MAG*10)
  critRate?: number;   // Crit rate per level
  critDamage?: number; // Crit damage per level
  evasion?: number;    // Evasion per level
  resistance?: number; // Resistance per level
}

// ========== COMBINED GROWTH ==========

export interface StatGrowth {
  primary: PrimaryGrowth;
  secondary: SecondaryGrowth;
}

// ========== DEFAULT GROWTH ==========

export const DEFAULT_PRIMARY_GROWTH: PrimaryGrowth = {
  vit: 2,
  atk: 2,
  def: 2,
  dex: 2,
  mag: 2,
};

export const DEFAULT_SECONDARY_GROWTH: SecondaryGrowth = {
  hpBonus: 0,
  manaBonus: 0,
  critRate: 0,
  critDamage: 0,
  evasion: 0,
  resistance: 0,
};

export const DEFAULT_GROWTH: StatGrowth = {
  primary: DEFAULT_PRIMARY_GROWTH,
  secondary: DEFAULT_SECONDARY_GROWTH,
};

// ========== GROWTH FACTORIES ==========

/**
 * Create primary growth with overrides
 */
export function createPrimaryGrowth(overrides: Partial<PrimaryGrowth>): PrimaryGrowth {
  return {
    vit: overrides.vit ?? 2,
    atk: overrides.atk ?? 2,
    def: overrides.def ?? 2,
    dex: overrides.dex ?? 2,
    mag: overrides.mag ?? 2,
  };
}

/**
 * Create secondary growth with overrides
 */
export function createSecondaryGrowth(overrides: Partial<SecondaryGrowth>): SecondaryGrowth {
  return {
    hpBonus: overrides.hpBonus ?? 0,
    manaBonus: overrides.manaBonus ?? 0,
    critRate: overrides.critRate ?? 0,
    critDamage: overrides.critDamage ?? 0,
    evasion: overrides.evasion ?? 0,
    resistance: overrides.resistance ?? 0,
  };
}

/**
 * Create combined stat growth
 */
export function createStatGrowth(
  primary: Partial<PrimaryGrowth> = {},
  secondary: Partial<SecondaryGrowth> = {}
): StatGrowth {
  return {
    primary: createPrimaryGrowth(primary),
    secondary: createSecondaryGrowth(secondary),
  };
}

// ========== GROWTH CALCULATIONS ==========

/**
 * Calculate primary stats with growth
 */
export function calculatePrimaryStatsWithGrowth(
  baseStats: PrimaryStats,
  growth: PrimaryGrowth,
  level: number
): PrimaryStats {
  const levelOffset = Math.max(0, level - 1);
  
  return {
    vit: baseStats.vit + Math.floor(growth.vit * levelOffset),
    atk: baseStats.atk + Math.floor(growth.atk * levelOffset),
    def: baseStats.def + Math.floor(growth.def * levelOffset),
    dex: baseStats.dex + Math.floor(growth.dex * levelOffset),
    mag: baseStats.mag + Math.floor(growth.mag * levelOffset),
  };
}

/**
 * Calculate secondary stats with growth
 */
export function calculateSecondaryStatsWithGrowth(
  primaryStats: PrimaryStats,
  growth: SecondaryGrowth,
  level: number,
  classBonus: SecondaryStatBonus = {}
): SecondaryStats {
  const levelOffset = Math.max(0, level - 1);
  
  const baseSecondary = createSecondaryStats(
    primaryStats.vit,
    primaryStats.mag,
    primaryStats.dex,
    primaryStats.def,
    primaryStats.atk,
    classBonus
  );
  
  // Apply growth bonuses
  return {
    // Resources
    hp: baseSecondary.hp + Math.floor((growth.hpBonus ?? 0) * levelOffset),
    maxHp: baseSecondary.maxHp + Math.floor((growth.hpBonus ?? 0) * levelOffset),
    mana: baseSecondary.mana + Math.floor((growth.manaBonus ?? 0) * levelOffset),
    maxMana: baseSecondary.maxMana + Math.floor((growth.manaBonus ?? 0) * levelOffset),
    
    // Combat
    critRate: Math.min(50, baseSecondary.critRate + Math.floor((growth.critRate ?? 0) * levelOffset)),
    critDamage: baseSecondary.critDamage + (growth.critDamage ?? 0) * levelOffset,
    evasion: Math.min(40, baseSecondary.evasion + Math.floor((growth.evasion ?? 0) * levelOffset)),
    accuracy: baseSecondary.accuracy,
    block: baseSecondary.block,
    
    // Defense
    resistance: Math.min(50, baseSecondary.resistance + Math.floor((growth.resistance ?? 0) * levelOffset)),
    damageReduction: baseSecondary.damageReduction,
    statusResistance: baseSecondary.statusResistance,
    tenacity: baseSecondary.tenacity,
    
    // Offense
    attackSpeed: baseSecondary.attackSpeed,
    lifeSteal: baseSecondary.lifeSteal,
  };
}

/**
 * Apply full stat growth to a Unit
 */
export function applyGrowthToUnit(
  unit: Unit,
  primaryStats: PrimaryStats,
  secondaryStats: SecondaryStats
): void {
  unit.vit = primaryStats.vit;
  unit.attack = primaryStats.atk;
  unit.defense = primaryStats.def;
  unit.speed = primaryStats.dex;
  unit.magic = primaryStats.mag;
  
  unit.hp = secondaryStats.hp;
  unit.maxHp = secondaryStats.maxHp;
  unit.mana = secondaryStats.mana;
  unit.maxMana = secondaryStats.maxMana;
  unit.critRate = secondaryStats.critRate;
  unit.critDamage = secondaryStats.critDamage;
  unit.evasion = secondaryStats.evasion;
  unit.resistance = secondaryStats.resistance;
}

// ========== GROWTH TEMPLATES FOR CLASSES ==========

/**
 * Tank class growth - high HP/DEF
 */
export const TANK_GROWTH: StatGrowth = {
  primary: {
    vit: 4,
    atk: 1,
    def: 4,
    dex: 1,
    mag: 0,
  },
  secondary: {
    hpBonus: 20,
  },
};

/**
 * DPS class growth - high ATK
 */
export const DPS_GROWTH: StatGrowth = {
  primary: {
    vit: 1,
    atk: 4,
    def: 1,
    dex: 3,
    mag: 1,
  },
  secondary: {},
};

/**
 * Caster class growth - high MAG
 */
export const CASTER_GROWTH: StatGrowth = {
  primary: {
    vit: 1,
    atk: 0,
    def: 1,
    dex: 2,
    mag: 5,
  },
  secondary: {
    manaBonus: 30,
  },
};

/**
 * Balanced growth - equal across all stats
 */
export const BALANCED_GROWTH: StatGrowth = {
  primary: {
    vit: 2,
    atk: 2,
    def: 2,
    dex: 2,
    mag: 2,
  },
  secondary: {},
};

/**
 * Speed growth - high DEX
 */
export const SPEED_GROWTH: StatGrowth = {
  primary: {
    vit: 1,
    atk: 2,
    def: 0,
    dex: 5,
    mag: 2,
  },
  secondary: {
    evasion: 1,
  },
};
