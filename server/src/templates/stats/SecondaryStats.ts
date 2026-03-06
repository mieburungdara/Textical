/**
 * Secondary Stats Definitions
 * 
 * Secondary stats are derived from primary stats, class bonuses, and race bonuses.
 * These stats determine combat outcomes like critical hits, evasion, etc.
 * 
 * ========== PRIMARY STATS (Base) ==========
 * - VIT: Vitality → HP
 * - MAG: Magic → Mana
 * - ATK: Attack → Physical damage
 * - DEF: Defense → Damage reduction (physical)
 * - DEX: Dexterity → Accuracy, evasion, speed
 * 
 * ========== SECONDARY STATS ==========
 * 
 * RESOURCE:
 * - HP: Health Points (derived from VIT)
 * - Mana: Magic Points (derived from MAG)
 * 
 * COMBAT:
 * - critRate: Critical hit chance (percentage)
 * - critDamage: Critical hit damage multiplier
 * - evasion: Chance to dodge attacks (percentage)
 * - accuracy: Hit chance (derived from DEX)
 * - block: Block chance (derived from DEF)
 * 
 * DEFENSE:
 * - resistance: Magic/elemental damage reduction (percentage)
 * - damageReduction: All damage reduction (percentage)
 * - statusResistance: Resistance to debuffs/CC (percentage)
 * - tenacity: Reduces CC duration (percentage)
 * 
 * OFFENSE:
 * - attackSpeed: Attack speed multiplier
 * - lifeSteal: Damage converted to heal (percentage)
 * 
 * GRID (for grid-based combat):
 * - attackRange: Attack range in tiles
 * - moveRange: Movement range in tiles per action
 * - minRange: Minimum range for ranged attacks
 */

import { Unit } from '../../combat/TickCost.js';
import { GridStats, GRID_STAT_LIMITS, DEFAULT_GRID_STATS } from './GridStats.js';

// ========== SECONDARY STAT TYPES ==========

export enum SecondaryStatType {
  // Resources
  HP = 'hp',
  MANA = 'mana',
  
  // Combat
  CRIT_RATE = 'critRate',
  CRIT_DAMAGE = 'critDamage',
  EVASION = 'evasion',
  ACCURACY = 'accuracy',
  BLOCK = 'block',
  
  // Defense
  RESISTANCE = 'resistance',
  DAMAGE_REDUCTION = 'damageReduction',
  STATUS_RESISTANCE = 'statusResistance',
  TENACITY = 'tenacity',
  
  // Offense
  ATTACK_SPEED = 'attackSpeed',
  LIFE_STEAL = 'lifeSteal',
  SPELL_VAMP = 'spellVamp',
}

// ========== SECONDARY STAT INTERFACE ==========

export interface SecondaryStats {
  // Resources
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  
  // Combat
  critRate: number;
  critDamage: number;
  evasion: number;
  accuracy: number;
  block: number;
  
  // Defense (different from resistance)
  resistance: number;           // Magic/elemental damage reduction
  damageReduction: number;       // All damage reduction
  statusResistance: number;      // Resistance to debuffs/CC
  tenacity: number;              // Reduces CC duration
  
  // Offense
  attackSpeed: number;           // Attack speed multiplier
  lifeSteal: number;             // Physical damage converted to heal
  spellVamp: number;            // Spell/magic damage converted to heal
  castSpeed: number;            // Casting speed (higher = faster)
  
  // Grid (extends GridStats)
  attackRange: number;
  moveRange: number;
  minRange: number;
}

// ========== SECONDARY STAT LIMITS ==========

export const SECONDARY_STAT_LIMITS = {
  // Resources
  HP: { MIN: 1, MAX: 999999 },
  MANA: { MIN: 0, MAX: 999999 },
  
  // Combat
  CRIT_RATE: { MIN: 0, MAX: 50 },       // Max 50%
  CRIT_DAMAGE: { MIN: 1.0, MAX: 5.0 },  // Max 500%
  EVASION: { MIN: 0, MAX: 40 },         // Max 40%
  ACCURACY: { MIN: 50, MAX: 100 },      // Min 50%, Max 100%
  BLOCK: { MIN: 0, MAX: 30 },           // Max 30%
  
  // Defense
  RESISTANCE: { MIN: 0, MAX: 50 },      // Max 50% magic reduction
  DAMAGE_REDUCTION: { MIN: 0, MAX: 75 }, // Max 75% all damage reduction
  STATUS_RESISTANCE: { MIN: 0, MAX: 50 }, // Max 50% debuff resist
  TENACITY: { MIN: 0, MAX: 50 },        // Max 50% CC duration reduction
  
  // Offense
  ATTACK_SPEED: { MIN: 0.5, MAX: 3.0 }, // Min 50%, Max 300% attack speed
  LIFE_STEAL: { MIN: 0, MAX: 50 },     // Max 50% lifesteal
  SPELL_VAMP: { MIN: 0, MAX: 50 },     // Max 50% spell vamp
  CAST_SPEED: { MIN: 10, MAX: 200 },   // Min 10, Max 200 cast speed
  
  // Grid (use imported from GridStats)
  ...GRID_STAT_LIMITS,
};

// ========== BASE SECONDARY STATS ==========

export const BASE_SECONDARY_STATS: SecondaryStats = {
  // Resources
  hp: 100,           // From VIT 10 * 10
  maxHp: 100,
  mana: 100,         // From MAG 10 * 10
  maxMana: 100,
  
  // Combat
  critRate: 5,       // Base 5%
  critDamage: 1.5,   // Base 150%
  evasion: 2,        // Base 2%
  accuracy: 75,      // Base 75%
  block: 5,         // Base 5%
  
  // Defense
  resistance: 2,            // Base 2% magic reduction
  damageReduction: 0,        // Base 0% all damage reduction
  statusResistance: 0,       // Base 0% debuff resistance
  tenacity: 0,               // Base 0% CC duration reduction
  
  // Offense
  attackSpeed: 1.0,          // Base 100% attack speed
  lifeSteal: 0,              // Base 0% lifesteal
  spellVamp: 0,              // Base 0% spell vamp
  castSpeed: 100,            // Base 100 cast speed (1.0x casting)
  
  // Grid (use imported defaults)
  ...DEFAULT_GRID_STATS,
};

// ========== STAT FORMULAS ==========

/**
 * Calculate HP from VIT
 */
export function calculateHp(vit: number): number {
  return Math.min(
    SECONDARY_STAT_LIMITS.HP.MAX,
    Math.max(SECONDARY_STAT_LIMITS.HP.MIN, vit * 10)
  );
}

/**
 * Calculate Mana from MAG
 */
export function calculateMana(mag: number): number {
  return Math.min(
    SECONDARY_STAT_LIMITS.MANA.MAX,
    Math.max(SECONDARY_STAT_LIMITS.MANA.MIN, mag * 10)
  );
}

/**
 * Calculate accuracy from DEX
 * Formula: accuracy = 50 + (DEX * 0.5), max 100
 */
export function calculateAccuracy(dex: number): number {
  return Math.min(
    SECONDARY_STAT_LIMITS.ACCURACY.MAX,
    Math.max(SECONDARY_STAT_LIMITS.ACCURACY.MIN, 50 + dex * 0.5)
  );
}

/**
 * Calculate block from DEF
 * Formula: block = 5 + (DEF * 0.3), max 30
 */
export function calculateBlock(def: number): number {
  return Math.min(
    SECONDARY_STAT_LIMITS.BLOCK.MAX,
    Math.max(SECONDARY_STAT_LIMITS.BLOCK.MIN, 5 + def * 0.3)
  );
}

// ========== STAT BONUS INTERFACE ==========

export interface SecondaryStatBonus {
  // Resources
  hp?: number;
  mana?: number;
  
  // Combat
  critRate?: number;
  critDamage?: number;
  evasion?: number;
  accuracy?: number;
  block?: number;
  
  // Defense
  resistance?: number;
  damageReduction?: number;
  statusResistance?: number;
  tenacity?: number;
  
  // Offense
  attackSpeed?: number;
  lifeSteal?: number;
  spellVamp?: number;
  castSpeed?: number;
  
  // Grid
  attackRange?: number;
  moveRange?: number;
  minRange?: number;
}

// ========== FACTORY FUNCTIONS ==========

/**
 * Create secondary stats from primary stats
 */
export function createSecondaryStats(
  vit: number,
  mag: number,
  dex: number,
  def: number,
  atk: number,
  classBonus: SecondaryStatBonus = {}
): SecondaryStats {
  const critRate = Math.min(
    SECONDARY_STAT_LIMITS.CRIT_RATE.MAX,
    (classBonus.critRate ?? BASE_SECONDARY_STATS.critRate)
  );
  
  const critDamage = Math.min(
    SECONDARY_STAT_LIMITS.CRIT_DAMAGE.MAX,
    classBonus.critDamage ?? BASE_SECONDARY_STATS.critDamage
  );
  
  const evasion = Math.min(
    SECONDARY_STAT_LIMITS.EVASION.MAX,
    (classBonus.evasion ?? BASE_SECONDARY_STATS.evasion)
  );
  
  const resistance = Math.min(
    SECONDARY_STAT_LIMITS.RESISTANCE.MAX,
    classBonus.resistance ?? BASE_SECONDARY_STATS.resistance
  );
  
  const damageReduction = Math.min(
    SECONDARY_STAT_LIMITS.DAMAGE_REDUCTION.MAX,
    classBonus.damageReduction ?? BASE_SECONDARY_STATS.damageReduction
  );
  
  const statusResistance = Math.min(
    SECONDARY_STAT_LIMITS.STATUS_RESISTANCE.MAX,
    classBonus.statusResistance ?? BASE_SECONDARY_STATS.statusResistance
  );
  
  const tenacity = Math.min(
    SECONDARY_STAT_LIMITS.TENACITY.MAX,
    classBonus.tenacity ?? BASE_SECONDARY_STATS.tenacity
  );
  
  const attackSpeed = Math.min(
    SECONDARY_STAT_LIMITS.ATTACK_SPEED.MAX,
    Math.max(SECONDARY_STAT_LIMITS.ATTACK_SPEED.MIN, 
      classBonus.attackSpeed ?? BASE_SECONDARY_STATS.attackSpeed)
  );
  
  const lifeSteal = Math.min(
    SECONDARY_STAT_LIMITS.LIFE_STEAL.MAX,
    classBonus.lifeSteal ?? BASE_SECONDARY_STATS.lifeSteal
  );
  
  const spellVamp = Math.min(
    SECONDARY_STAT_LIMITS.SPELL_VAMP.MAX,
    classBonus.spellVamp ?? BASE_SECONDARY_STATS.spellVamp
  );
  
  const castSpeed = Math.min(
    SECONDARY_STAT_LIMITS.CAST_SPEED.MAX,
    Math.max(SECONDARY_STAT_LIMITS.CAST_SPEED.MIN,
      classBonus.castSpeed ?? BASE_SECONDARY_STATS.castSpeed)
  );
  
  return {
    // Resources
    hp: calculateHp(vit) + (classBonus.hp ?? 0),
    maxHp: calculateHp(vit) + (classBonus.hp ?? 0),
    mana: calculateMana(mag) + (classBonus.mana ?? 0),
    maxMana: calculateMana(mag) + (classBonus.mana ?? 0),
    
    // Combat
    critRate,
    critDamage,
    evasion,
    accuracy: calculateAccuracy(dex),
    block: calculateBlock(def),
    
    // Defense
    resistance,
    damageReduction,
    statusResistance,
    tenacity,
    
    // Offense
    attackSpeed,
    lifeSteal,
    spellVamp,
    castSpeed,
    
    // Grid
    attackRange: classBonus.attackRange ?? BASE_SECONDARY_STATS.attackRange,
    moveRange: classBonus.moveRange ?? BASE_SECONDARY_STATS.moveRange,
    minRange: classBonus.minRange ?? BASE_SECONDARY_STATS.minRange,
  };
}

/**
 * Apply secondary stats to a Unit
 */
export function applySecondaryStatsToUnit(
  unit: Unit,
  stats: SecondaryStats
): void {
  // Resources
  unit.hp = stats.hp;
  unit.maxHp = stats.maxHp;
  unit.mana = stats.mana;
  unit.maxMana = stats.maxMana;
  
  // Combat
  unit.critRate = stats.critRate;
  unit.critDamage = stats.critDamage;
  unit.evasion = stats.evasion;
  unit.resistance = stats.resistance;
  unit.accuracy = stats.accuracy;
  unit.block = stats.block;
  
  // Defense
  unit.damageReduction = stats.damageReduction;
  unit.statusResistance = stats.statusResistance;
  unit.tenacity = stats.tenacity;
  
  // Offense
  unit.attackSpeed = stats.attackSpeed;
  unit.lifeSteal = stats.lifeSteal;
  unit.spellVamp = stats.spellVamp;
  unit.castSpeed = stats.castSpeed;
  
  // Grid
  unit.attackRange = stats.attackRange;
  unit.moveRange = stats.moveRange;
  unit.minRange = stats.minRange;
}

/**
 * Add bonus to secondary stats
 */
export function addSecondaryStats(
  base: SecondaryStats,
  bonus: SecondaryStatBonus
): SecondaryStats {
  return {
    // Resources
    hp: Math.min(SECONDARY_STAT_LIMITS.HP.MAX, base.hp + (bonus.hp ?? 0)),
    maxHp: Math.min(SECONDARY_STAT_LIMITS.HP.MAX, base.maxHp + (bonus.hp ?? 0)),
    mana: Math.min(SECONDARY_STAT_LIMITS.MANA.MAX, base.mana + (bonus.mana ?? 0)),
    maxMana: Math.min(SECONDARY_STAT_LIMITS.MANA.MAX, base.maxMana + (bonus.mana ?? 0)),
    
    // Combat
    critRate: Math.min(SECONDARY_STAT_LIMITS.CRIT_RATE.MAX, base.critRate + (bonus.critRate ?? 0)),
    critDamage: Math.min(SECONDARY_STAT_LIMITS.CRIT_DAMAGE.MAX, base.critDamage + (bonus.critDamage ?? 0)),
    evasion: Math.min(SECONDARY_STAT_LIMITS.EVASION.MAX, base.evasion + (bonus.evasion ?? 0)),
    accuracy: Math.min(SECONDARY_STAT_LIMITS.ACCURACY.MAX, base.accuracy + (bonus.accuracy ?? 0)),
    block: Math.min(SECONDARY_STAT_LIMITS.BLOCK.MAX, base.block + (bonus.block ?? 0)),
    
    // Defense
    resistance: Math.min(SECONDARY_STAT_LIMITS.RESISTANCE.MAX, base.resistance + (bonus.resistance ?? 0)),
    damageReduction: Math.min(SECONDARY_STAT_LIMITS.DAMAGE_REDUCTION.MAX, base.damageReduction + (bonus.damageReduction ?? 0)),
    statusResistance: Math.min(SECONDARY_STAT_LIMITS.STATUS_RESISTANCE.MAX, base.statusResistance + (bonus.statusResistance ?? 0)),
    tenacity: Math.min(SECONDARY_STAT_LIMITS.TENACITY.MAX, base.tenacity + (bonus.tenacity ?? 0)),
    
    // Offense
    attackSpeed: Math.min(SECONDARY_STAT_LIMITS.ATTACK_SPEED.MAX, Math.max(SECONDARY_STAT_LIMITS.ATTACK_SPEED.MIN, base.attackSpeed + (bonus.attackSpeed ?? 0))),
    lifeSteal: Math.min(SECONDARY_STAT_LIMITS.LIFE_STEAL.MAX, base.lifeSteal + (bonus.lifeSteal ?? 0)),
    spellVamp: Math.min(SECONDARY_STAT_LIMITS.SPELL_VAMP.MAX, base.spellVamp + (bonus.spellVamp ?? 0)),
    castSpeed: Math.min(SECONDARY_STAT_LIMITS.CAST_SPEED.MAX, Math.max(SECONDARY_STAT_LIMITS.CAST_SPEED.MIN, base.castSpeed + (bonus.castSpeed ?? 0))),
    
    // Grid
    attackRange: Math.min(SECONDARY_STAT_LIMITS.ATTACK_RANGE.MAX, Math.max(SECONDARY_STAT_LIMITS.ATTACK_RANGE.MIN, base.attackRange + (bonus.attackRange ?? 0))),
    moveRange: Math.min(SECONDARY_STAT_LIMITS.MOVE_RANGE.MAX, Math.max(SECONDARY_STAT_LIMITS.MOVE_RANGE.MIN, base.moveRange + (bonus.moveRange ?? 0))),
    minRange: Math.min(SECONDARY_STAT_LIMITS.MIN_RANGE.MAX, Math.max(SECONDARY_STAT_LIMITS.MIN_RANGE.MIN, base.minRange + (bonus.minRange ?? 0))),
  };
}

/**
 * Clamp secondary stats to valid ranges
 */
export function clampSecondaryStats(stats: SecondaryStats): SecondaryStats {
  return {
    // Resources
    hp: Math.min(SECONDARY_STAT_LIMITS.HP.MAX, Math.max(SECONDARY_STAT_LIMITS.HP.MIN, stats.hp)),
    maxHp: Math.min(SECONDARY_STAT_LIMITS.HP.MAX, Math.max(SECONDARY_STAT_LIMITS.HP.MIN, stats.maxHp)),
    mana: Math.min(SECONDARY_STAT_LIMITS.MANA.MAX, Math.max(SECONDARY_STAT_LIMITS.MANA.MIN, stats.mana)),
    maxMana: Math.min(SECONDARY_STAT_LIMITS.MANA.MAX, Math.max(SECONDARY_STAT_LIMITS.MANA.MIN, stats.maxMana)),
    
    // Combat
    critRate: Math.min(SECONDARY_STAT_LIMITS.CRIT_RATE.MAX, Math.max(SECONDARY_STAT_LIMITS.CRIT_RATE.MIN, stats.critRate)),
    critDamage: Math.min(SECONDARY_STAT_LIMITS.CRIT_DAMAGE.MAX, Math.max(SECONDARY_STAT_LIMITS.CRIT_DAMAGE.MIN, stats.critDamage)),
    evasion: Math.min(SECONDARY_STAT_LIMITS.EVASION.MAX, Math.max(SECONDARY_STAT_LIMITS.EVASION.MIN, stats.evasion)),
    accuracy: Math.min(SECONDARY_STAT_LIMITS.ACCURACY.MAX, Math.max(SECONDARY_STAT_LIMITS.ACCURACY.MIN, stats.accuracy)),
    block: Math.min(SECONDARY_STAT_LIMITS.BLOCK.MAX, Math.max(SECONDARY_STAT_LIMITS.BLOCK.MIN, stats.block)),
    
    // Defense
    resistance: Math.min(SECONDARY_STAT_LIMITS.RESISTANCE.MAX, Math.max(SECONDARY_STAT_LIMITS.RESISTANCE.MIN, stats.resistance)),
    damageReduction: Math.min(SECONDARY_STAT_LIMITS.DAMAGE_REDUCTION.MAX, Math.max(SECONDARY_STAT_LIMITS.DAMAGE_REDUCTION.MIN, stats.damageReduction)),
    statusResistance: Math.min(SECONDARY_STAT_LIMITS.STATUS_RESISTANCE.MAX, Math.max(SECONDARY_STAT_LIMITS.STATUS_RESISTANCE.MIN, stats.statusResistance)),
    tenacity: Math.min(SECONDARY_STAT_LIMITS.TENACITY.MAX, Math.max(SECONDARY_STAT_LIMITS.TENACITY.MIN, stats.tenacity)),
    
    // Offense
    attackSpeed: Math.min(SECONDARY_STAT_LIMITS.ATTACK_SPEED.MAX, Math.max(SECONDARY_STAT_LIMITS.ATTACK_SPEED.MIN, stats.attackSpeed)),
    lifeSteal: Math.min(SECONDARY_STAT_LIMITS.LIFE_STEAL.MAX, Math.max(SECONDARY_STAT_LIMITS.LIFE_STEAL.MIN, stats.lifeSteal)),
    spellVamp: Math.min(SECONDARY_STAT_LIMITS.SPELL_VAMP.MAX, Math.max(SECONDARY_STAT_LIMITS.SPELL_VAMP.MIN, stats.spellVamp)),
    castSpeed: Math.min(SECONDARY_STAT_LIMITS.CAST_SPEED.MAX, Math.max(SECONDARY_STAT_LIMITS.CAST_SPEED.MIN, stats.castSpeed)),
    
    // Grid
    attackRange: Math.min(SECONDARY_STAT_LIMITS.ATTACK_RANGE.MAX, Math.max(SECONDARY_STAT_LIMITS.ATTACK_RANGE.MIN, stats.attackRange)),
    moveRange: Math.min(SECONDARY_STAT_LIMITS.MOVE_RANGE.MAX, Math.max(SECONDARY_STAT_LIMITS.MOVE_RANGE.MIN, stats.moveRange)),
    minRange: Math.min(SECONDARY_STAT_LIMITS.MIN_RANGE.MAX, Math.max(SECONDARY_STAT_LIMITS.MIN_RANGE.MIN, stats.minRange)),
  };
}
