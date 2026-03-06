/**
 * Base Class Template System
 * 
 * Individual classes inherit from this base to allow easy modification.
 * Each class has its own file in the classes/ folder.
 * 
 * Usage:
 * - Import base types from here
 * - Individual class templates in classes/ folder
 */

import { Unit } from '../combat/TickCost.js';
import { DEFAULT_GRID_STATS } from './stats/GridStats.js';

// ========== JOB TIERS ==========

export enum JobTier {
  NOVICE = 'novice',       
  FIRST_JOB = 'first_job',   
  SECOND_JOB = 'second_job', 
  MASTER = 'master',       
}

// ========== JOB CATEGORIES ==========

export enum JobCategory {
  PHYSICAL = 'physical',   
  RANGED = 'ranged',       
  MAGIC = 'magic',         
  HEALER = 'healer',       
  TANK = 'tank',           
  HYBRID = 'hybrid',       
  SUPPORT = 'support',     
}

// ========== STAT GROWTH ==========

export interface ClassStatGrowth {
  hp: number;        // HP per level (from VIT)
  vit: number;       // VIT per level
  attack: number;    // STR-based attack per level
  defense: number;   // DEF per level
  dex: number;       // DEX per level
  magic: number;     // INT-based magic per level
  mana: number;      // MANA per level (from MAG)
}

// ========== BASE CLASS TEMPLATE ==========

export interface ClassTemplate {
  id: string;
  name: string;
  jobTier: JobTier;
  jobCategory: JobCategory;
  prerequisiteJob?: string;
  
  // Base stats at level 1
  baseHp: number;      // Derived from VIT (baseVIT * 10)
  baseVit: number;     // VIT - determines Max HP
  baseAttack: number;  // STR-based
  baseDefense: number; // DEF-based
  baseDex: number;     // DEX-based (speed/evasion)
  baseMagic: number;   // INT-based (spell power)
  baseMana: number;    // Derived from MAG (baseMAG * 10)
  
  // Stat growth per level
  growth: ClassStatGrowth;
  
  // Combat bonuses
  critRateBonus: number;
  critDamageBonus: number;
  evasionBonus: number;
  resistanceBonus: number;
  
  // Grid stats (optional, defaults will be used if not specified)
  attackRange?: number;
  moveRange?: number;
  minRange?: number;
  
  // Description
  description: string;
  roles: string[];
}

// ========== FACTORY FUNCTION ==========

/**
 * Create a unit from class template with level scaling
 * Note: Import CLASS_TEMPLATES directly from './classes/index.js' for custom implementations
 */
export function createUnitFromClass(
  classId: string,
  level: number,
  id: string,
  customName?: string,
  templateOverride?: Record<string, any>
): Unit {
  const templates = templateOverride || {};
  
  const template = templates[classId];
  
  if (!template) {
    throw new Error(`Class template not found: ${classId}`);
  }
  
  const name = customName || template.name;
  const levelOffset = Math.max(0, level - 1);
  
  // Calculate primary stats with growth
  const vit = template.baseVit + (template.growth.vit * levelOffset);
  const attack = template.baseAttack + (template.growth.attack * levelOffset);
  const defense = template.baseDefense + (template.growth.defense * levelOffset);
  const dex = template.baseDex + (template.growth.dex * levelOffset);
  const magic = template.baseMagic + (template.growth.magic * levelOffset);
  
  // Calculate derived stats (HP/MANA)
  // HP = VIT * 10 + growth.hp * levelOffset
  const hp = (vit * 10) + (template.growth.hp * levelOffset);
  // Mana = MAG * 10 + growth.mana * levelOffset
  const mana = (magic * 10) + (template.growth.mana * levelOffset);
  
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
    critRate: template.critRateBonus,
    critDamage: 1.0 + template.critDamageBonus,
    evasion: template.evasionBonus,
    accuracy: 75 + Math.floor(dex * 0.5), // Base accuracy from DEX
    block: 5 + Math.floor(defense * 0.3), // Base block from DEF
    
    // Secondary Stats - Defense
    resistance: template.resistanceBonus,
    damageReduction: 0, // Default 0, from items/buffs
    statusResistance: 0, // Default 0, from items/buffs
    tenacity: 0, // Default 0, from items/buffs
    
    // Secondary Stats - Offense
    attackSpeed: 1.0, // Base 100%, from items/skills
    lifeSteal: 0, // Default 0, from items/skills
    spellVamp: 0, // Default 0, from items/skills
    castSpeed: 100, // Default 100
    
    // Grid Stats
    attackRange: template.attackRange ?? DEFAULT_GRID_STATS.attackRange,
    moveRange: template.moveRange ?? DEFAULT_GRID_STATS.moveRange,
    minRange: template.minRange ?? DEFAULT_GRID_STATS.minRange,
  };
}

/**
 * Get job progression
 * Note: Import JOB_PROGRESSION directly from './classes/index.js'
 */
export function getJobAdvancements(classId: string, progressionOverride?: Record<string, string[]>): string[] {
  const progression = progressionOverride || {};
  return progression[classId] || [];
}

/**
 * Check if can advance
 */
export function canAdvanceTo(classId: string, targetClassId: string, progressionOverride?: Record<string, string[]>): boolean {
  const advancements = getJobAdvancements(classId, progressionOverride);
  return advancements.includes(targetClassId);
}
