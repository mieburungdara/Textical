/**
 * Combat Stats Calculator
 * 
 * Centralized factory functions for calculating combat stats.
 * Applies DRY principle by consolidating repeated stat calculations
 * in one place.
 * 
 * Used by:
 * - ClassTemplate
 * - MonsterTemplate
 * - RaceTemplate
 * - UnitTemplates
 * - StatGrowth
 * 
 * Note: Some functions (calculateAccuracy, calculateBlock) are
 * imported from SecondaryStats.ts to avoid duplication.
 */

import { Unit } from '../../combat/TickCost.js';
import { SECONDARY_STAT_LIMITS, SecondaryStatBonus, SecondaryStats, calculateAccuracy, calculateBlock } from './SecondaryStats.js';
import { DEFAULT_GRID_STATS } from './GridStats.js';

// Re-export from SecondaryStats
export { calculateAccuracy, calculateBlock };

/**
 * Combat Bonus Interface
 * Represents combat bonuses from class/template
 */
export interface CombatBonus {
  critRateBonus: number;
  critDamageBonus: number;
  evasionBonus: number;
  resistanceBonus: number;
  lifeStealBonus?: number;
}

/**
 * Calculate critRate from bonus
 */
export function calculateCritRate(bonus: number): number {
  return Math.min(SECONDARY_STAT_LIMITS.CRIT_RATE.MAX, bonus);
}

/**
 * Calculate critDamage from bonus
 */
export function calculateCritDamage(bonus: number): number {
  return 1.0 + Math.min(
    SECONDARY_STAT_LIMITS.CRIT_DAMAGE.MAX - 1,
    bonus
  );
}

/**
 * Calculate evasion from bonus (with level scaling optional)
 */
export function calculateEvasion(bonus: number, levelBonus: number = 0): number {
  return Math.min(
    SECONDARY_STAT_LIMITS.EVASION.MAX,
    bonus + levelBonus
  );
}

/**
 * Calculate resistance from bonus (with level scaling optional)
 */
export function calculateCombatResistance(bonus: number, levelBonus: number = 0): number {
  return Math.min(
    SECONDARY_STAT_LIMITS.RESISTANCE.MAX,
    bonus + levelBonus
  );
}

/**
 * Calculate lifeSteal from bonus
 */
export function calculateLifeSteal(bonus: number): number {
  return Math.min(SECONDARY_STAT_LIMITS.LIFE_STEAL.MAX, bonus);
}

/**
 * Create combat secondary stats from bonuses
 */
export function createCombatStats(
  vit: number,
  mag: number,
  dex: number,
  def: number,
  atk: number,
  bonus: CombatBonus,
  levelBonus: {
    critRate?: number;
    critDamage?: number;
    evasion?: number;
    resistance?: number;
  } = {}
): Pick<SecondaryStats, 
  | 'critRate' 
  | 'critDamage' 
  | 'evasion' 
  | 'accuracy' 
  | 'block' 
  | 'resistance' 
  | 'lifeSteal'
> {
  return {
    // Combat stats
    critRate: calculateCritRate(bonus.critRateBonus + (levelBonus.critRate ?? 0)),
    critDamage: calculateCritDamage(bonus.critDamageBonus + (levelBonus.critDamage ?? 0)),
    evasion: calculateEvasion(bonus.evasionBonus, levelBonus.evasion ?? 0),
    accuracy: calculateAccuracy(dex),
    block: calculateBlock(def),
    
    // Defense
    resistance: calculateCombatResistance(bonus.resistanceBonus, levelBonus.resistance ?? 0),
    
    // Offense
    lifeSteal: calculateLifeSteal(bonus.lifeStealBonus ?? 0),
  };
}

/**
 * Apply combat stats to a Unit
 */
export function applyCombatStatsToUnit(
  unit: Unit,
  stats: ReturnType<typeof createCombatStats>
): void {
  unit.critRate = stats.critRate;
  unit.critDamage = stats.critDamage;
  unit.evasion = stats.evasion;
  unit.accuracy = stats.accuracy;
  unit.block = stats.block;
  unit.resistance = stats.resistance;
  unit.lifeSteal = stats.lifeSteal;
}

/**
 * Add combat bonuses to existing stats
 */
export function addCombatBonuses(
  base: SecondaryStats,
  bonus: CombatBonus
): Pick<SecondaryStats, 
  | 'critRate' 
  | 'critDamage' 
  | 'evasion' 
  | 'resistance' 
  | 'lifeSteal'
> {
  return {
    critRate: Math.min(
      SECONDARY_STAT_LIMITS.CRIT_RATE.MAX,
      base.critRate + bonus.critRateBonus
    ),
    critDamage: Math.min(
      SECONDARY_STAT_LIMITS.CRIT_DAMAGE.MAX,
      base.critDamage + bonus.critDamageBonus
    ),
    evasion: Math.min(
      SECONDARY_STAT_LIMITS.EVASION.MAX,
      base.evasion + bonus.evasionBonus
    ),
    resistance: Math.min(
      SECONDARY_STAT_LIMITS.RESISTANCE.MAX,
      base.resistance + bonus.resistanceBonus
    ),
    lifeSteal: Math.min(
      SECONDARY_STAT_LIMITS.LIFE_STEAL.MAX,
      base.lifeSteal + (bonus.lifeStealBonus ?? 0)
    ),
  };
}

/**
 * Default combat bonus (no bonuses)
 */
export const DEFAULT_COMBAT_BONUS: CombatBonus = {
  critRateBonus: 0,
  critDamageBonus: 0,
  evasionBonus: 0,
  resistanceBonus: 0,
};

/**
 * Create grid stats with defaults
 */
export function createCombatGridStats(
  attackRange?: number,
  moveRange?: number,
  minRange?: number
) {
  return {
    attackRange: attackRange ?? DEFAULT_GRID_STATS.attackRange,
    moveRange: moveRange ?? DEFAULT_GRID_STATS.moveRange,
    minRange: minRange ?? DEFAULT_GRID_STATS.minRange,
  };
}
