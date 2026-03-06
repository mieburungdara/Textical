/**
 * Stats Template System
 * 
 * Central export point for all stat-related templates.
 * 
 * Structure:
 * - PrimaryStats: Base stats (VIT, ATK, DEF, DEX, MAG)
 * - SecondaryStats: Derived stats (HP, Mana, Crit, Evasion, etc.)
 * - StatGrowth: Level-up growth formulas
 */

export * from './PrimaryStats.js';
export * from './SecondaryStats.js';
export * from './StatGrowth.js';

// ========== CONVENIENCE IMPORTS ==========

import { Unit } from '../../combat/TickCost.js';
import { PrimaryStats, createPrimaryStatsWith, addPrimaryStats } from './PrimaryStats.js';
import { SecondaryStats, createSecondaryStats, addSecondaryStats, clampSecondaryStats } from './SecondaryStats.js';
import { StatGrowth, calculatePrimaryStatsWithGrowth, calculateSecondaryStatsWithGrowth, applyGrowthToUnit } from './StatGrowth.js';

/**
 * Complete stat calculation for a unit
 * Combines base stats + growth + level into final Unit stats
 */
export function calculateUnitStats(
  baseStats: PrimaryStats,
  growth: StatGrowth,
  level: number,
  classBonus: {
    critRate?: number;
    critDamage?: number;
    evasion?: number;
    resistance?: number;
  } = {}
): Unit {
  // Calculate primary stats with growth
  const primaryWithGrowth = calculatePrimaryStatsWithGrowth(
    baseStats,
    growth.primary,
    level
  );
  
  // Calculate secondary stats with growth
  const secondaryWithGrowth = calculateSecondaryStatsWithGrowth(
    primaryWithGrowth,
    growth.secondary,
    level,
    classBonus
  );
  
  // Clamp secondary stats
  const clampedSecondary = clampSecondaryStats(secondaryWithGrowth);
  
  // Create unit with calculated stats
  const unit: Unit = {
    id: '',
    name: '',
    level,
    
    // Primary Stats
    vit: primaryWithGrowth.vit,
    hp: clampedSecondary.hp,
    maxHp: clampedSecondary.maxHp,
    mana: clampedSecondary.mana,
    maxMana: clampedSecondary.maxMana,
    attack: primaryWithGrowth.atk,
    defense: primaryWithGrowth.def,
    speed: primaryWithGrowth.dex,
    magic: primaryWithGrowth.mag,
    
    // Secondary Stats - Combat
    critRate: clampedSecondary.critRate,
    critDamage: clampedSecondary.critDamage,
    evasion: clampedSecondary.evasion,
    accuracy: clampedSecondary.accuracy,
    block: clampedSecondary.block,
    
    // Secondary Stats - Defense
    resistance: clampedSecondary.resistance,
    damageReduction: clampedSecondary.damageReduction,
    statusResistance: clampedSecondary.statusResistance,
    tenacity: clampedSecondary.tenacity,
    
    // Secondary Stats - Offense
    attackSpeed: clampedSecondary.attackSpeed,
    lifeSteal: clampedSecondary.lifeSteal,
  };
  
  return unit;
}
