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

// ========== FACTORY FUNCTION ==========

/**
 * Create a unit from class + race with level scaling
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
  
  // ========== EXPONENTIAL GROWTH FORMULA ==========
  // stat = (classBase * raceGrowthRate^levelOffset) + raceFlatBonus
  // Example: ATK = 15 × 1.05^9 + 5 = 28 at level 10
  
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
  const vit = Math.floor(grownVit + raceMod.vit);
  const attack = Math.floor(grownAttack + raceMod.attack);
  const defense = Math.floor(grownDefense + raceMod.defense);
  const dex = Math.floor(grownDex + raceMod.dex);
  const magic = Math.floor(grownMagic + raceMod.magic);
  
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
