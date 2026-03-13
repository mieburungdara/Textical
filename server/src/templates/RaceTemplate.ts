/**
 * Race Template System
 * 
 * Races provide base stat modifiers on top of class stats.
 * Each race has unique bonuses that affect starting stats.
 * 
 * Usage:
 * - Import base types from here
 * - Individual race templates in races/ folder
 */

import { Unit } from '../combat/TickCost.js';

// ========== RACE TYPES ==========

export enum RaceType {
  HUMAN = 'human',
  ELF = 'elf',
  DWARF = 'dwarf',
  ORC = 'orc',
  UNDEAD = 'undead',
  BEASTMAN = 'beastman',
}

// ========== RACE STAT MODIFIERS ==========

export interface RaceStatModifier {
  vit: number;       // Flat bonus to VIT (affects HP)
  hp: number;        // Flat bonus to HP (additional, rare)
  attack: number;   // Flat bonus to ATK (STR)
  defense: number;  // Flat bonus to DEF
  dex: number;       // Flat bonus to DEX
  magic: number;    // Flat bonus to INT
  mana: number;     // Flat bonus to MANA (additional)
  critRate: number; // Percentage bonus
  evasion: number;  // Percentage bonus
}

// ========== RACE GROWTH RATES ==========
// Exponential growth per level: stat = base * growthRate^(level-1)
// Each race has unique growth rates for each stat

export interface RaceGrowthRates {
  vit: number;      // HP growth per level (e.g., 1.03 = +3%)
  attack: number;   // STR/ATK growth per level
  defense: number; // DEF growth per level
  dex: number;      // DEX/speed growth per level
  magic: number;    // INT/magic growth per level
}

export interface RaceTemplate {
  id: string;
  name: string;
  raceType: RaceType;
  
  // Stat modifiers (added on top of class stats)
  statModifiers: RaceStatModifier;
  
  // Growth rates per level (exponential)
  // stat = base * growthRate^(level-1)
  growthRates: RaceGrowthRates;
  
  // Special abilities/bonuses
  bonusAbilities: string[];
  
  // Description
  description: string;
}

// ========== CLASS MULTIPLIERS FOR JOB CHANGES ==========
// When a player changes jobs (promotes), apply a multiplier to all stats
// This gives players a sense of progression when they advance

export enum JobTier {
  NOVICE = 'novice',       
  FIRST_JOB = 'first_job',   
  SECOND_JOB = 'second_job', 
  MASTER = 'master',       
}

// Multiplier applied when advancing to a new job tier
// Example: Novice (1.0) → Fighter (1.2x) → Knight (1.3x) → Grandmaster (1.5x)
export const JOB_TIER_MULTIPLIERS: Record<JobTier, number> = {
  [JobTier.NOVICE]: 1.0,       // Base - no multiplier
  [JobTier.FIRST_JOB]: 1.2,    // +20% stats when promoted to first job
  [JobTier.SECOND_JOB]: 1.3,   // +30% stats when promoted to second job
  [JobTier.MASTER]: 1.5,       // +50% stats when promoted to master
};

// ========== FACTORY FUNCTION ==========

/**
 * Create a unit from class + race with level scaling
 * 
 * @param classId - The class template ID (e.g., 'swordsman', 'mage')
 * @param level - The character's level
 * @param id - Unique identifier for the unit
 * @param options - Optional parameters:
 *   - customName: Override the default name
 *   - raceId: Race template ID (default: 'human')
 *   - classTemplates: Override class templates
 *   - raceTemplates: Override race templates
 *   - previousJobTier: The previous job tier (for job change bonuses)
 *   - currentJobTier: The current job tier (determines multiplier)
 */
export function createUnitFromClass(
  classId: string,
  level: number,
  id: string,
  options?: {
    customName?: string;
    raceId?: string;
    classTemplates?: Record<string, any>;
    raceTemplates?: Record<string, any>;
    previousJobTier?: JobTier;
    currentJobTier?: JobTier;
  }
): Unit {
  const templates = options?.classTemplates || {};
  const raceTemplates = options?.raceTemplates || {};
  
  const classTemplate = templates[classId];
  
  if (!classTemplate) {
    throw new Error(`Class template not found: ${classId}`);
  }
  
  const name = options?.customName || classTemplate.name;
  const levelOffset = Math.max(0, level - 1);
  
  // Get race modifiers and growth rates
  const raceId = options?.raceId || 'human';
  const race = raceTemplates[raceId] || raceTemplates['human'];
  const raceMod = race?.statModifiers || {
    vit: 0, hp: 0, attack: 0, defense: 0, dex: 0, magic: 0, mana: 0, critRate: 0, evasion: 0
  };
  
  // Get race growth rates (default to 1.03 if not specified)
  const growth = race?.growthRates || {
    vit: 1.03, attack: 1.03, defense: 1.03, dex: 1.03, magic: 1.03
  };
  
  // ========== JOB TIER MULTIPLIER ==========
  // Apply multiplier based on job tier
  const currentTier = options?.currentJobTier || (classTemplate.jobTier as JobTier) || JobTier.NOVICE;
  const previousTier = options?.previousJobTier || JobTier.NOVICE;
  
  // Calculate the cumulative multiplier from previous job tier to current
  const previousMultiplier = JOB_TIER_MULTIPLIERS[previousTier] || 1.0;
  const currentMultiplier = JOB_TIER_MULTIPLIERS[currentTier] || 1.0;
  
  // The bonus multiplier is the ratio of current to previous (e.g., 1.2/1.0 = 1.2)
  const jobMultiplier = currentMultiplier / previousMultiplier;
  
  // ========== EXPONENTIAL GROWTH FORMULA ==========
  // stat = (classBase * raceGrowthRate^levelOffset) + raceFlatBonus
  // Then multiply by job tier bonus
  // Example: ATK = 15 × 1.05^9 + 5 = 28 at level 10, then ×1.2 = 34
  
  // Get class base stats at level 1
  const classBaseVit = classTemplate.baseVit;
  const classBaseAttack = classTemplate.baseAttack;
  const classBaseDefense = classTemplate.baseDefense;
  const classBaseDex = classTemplate.baseDex;
  const classBaseMagic = classTemplate.baseMagic;
  
  // Calculate class base stats with race-specific exponential growth
  const grownVit = classBaseVit * Math.pow(growth.vit, levelOffset);
  const grownAttack = classBaseAttack * Math.pow(growth.attack, levelOffset);
  const grownDefense = classBaseDefense * Math.pow(growth.defense, levelOffset);
  const grownDex = classBaseDex * Math.pow(growth.dex, levelOffset);
  const grownMagic = classBaseMagic * Math.pow(growth.magic, levelOffset);
  
  // Then add race flat modifiers (not scaled by level)
  let vit = Math.floor(grownVit + raceMod.vit);
  let attack = Math.floor(grownAttack + raceMod.attack);
  let defense = Math.floor(grownDefense + raceMod.defense);
  let dex = Math.floor(grownDex + raceMod.dex);
  let magic = Math.floor(grownMagic + raceMod.magic);
  
  // Apply job tier multiplier (only if not base novice)
  if (jobMultiplier > 1.0) {
    vit = Math.floor(vit * jobMultiplier);
    attack = Math.floor(attack * jobMultiplier);
    defense = Math.floor(defense * jobMultiplier);
    dex = Math.floor(dex * jobMultiplier);
    magic = Math.floor(magic * jobMultiplier);
  }
  
  // Calculate derived stats (HP = VIT * 10, MANA = MAGIC * 10)
  const hp = vit * 10;
  const mana = magic * 10;
  
  return {
    id,
    name,
    level,
    
    // Primary Stats
    vit: Math.floor(vit),
    hp: Math.floor(hp),
    maxHp: Math.floor(hp),
    mana: Math.floor(mana),
    maxMana: Math.floor(mana),
    attack: Math.floor(attack),
    defense: Math.floor(defense),
    speed: Math.floor(dex),
    magic: Math.floor(magic),
    
    // Secondary Stats - Combat
    critRate: Math.min(50, (classTemplate.critRateBonus || 0) + raceMod.critRate),
    critDamage: 1.0 + (classTemplate.critDamageBonus || 0),
    evasion: Math.min(40, (classTemplate.evasionBonus || 0) + raceMod.evasion),
    accuracy: Math.min(100, 75 + Math.floor(dex * 0.5)), // Base from DEX
    block: Math.min(30, 5 + Math.floor(defense * 0.3)), // Base from DEF
    
    // Secondary Stats - Defense
    resistance: classTemplate.resistanceBonus || 0,
    damageReduction: 0, // Default 0
    statusResistance: 0, // Default 0
    tenacity: 0, // Default 0
    
    // Secondary Stats - Offense
    attackSpeed: 1.0, // Default 100%
    lifeSteal: 0, // Default 0
    spellVamp: 0, // Default 0
    castSpeed: 100, // Default 100
    
    // Grid Stats
    attackRange: 1,
    moveRange: 3,
    minRange: 0,
  };
}
