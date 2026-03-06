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

export interface RaceTemplate {
  id: string;
  name: string;
  raceType: RaceType;
  
  // Stat modifiers (added on top of class stats)
  statModifiers: RaceStatModifier;
  
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
  
  // Get race modifiers
  const raceId = options?.raceId || 'human';
  const race = raceTemplates[raceId] || raceTemplates['human'];
  const raceMod = race?.statModifiers || {
    vit: 0, hp: 0, attack: 0, defense: 0, dex: 0, magic: 0, mana: 0, critRate: 0, evasion: 0
  };
  
  // Calculate primary stats with class growth + race modifiers
  const classVit = classTemplate.baseVit + (classTemplate.growth.vit * levelOffset);
  const classAttack = classTemplate.baseAttack + (classTemplate.growth.attack * levelOffset);
  const classDefense = classTemplate.baseDefense + (classTemplate.growth.defense * levelOffset);
  const classDex = classTemplate.baseDex + (classTemplate.growth.dex * levelOffset);
  const classMagic = classTemplate.baseMagic + (classTemplate.growth.magic * levelOffset);
  
  // Apply race modifiers
  const vit = classVit + raceMod.vit;
  const attack = classAttack + raceMod.attack;
  const defense = classDefense + raceMod.defense;
  const dex = classDex + raceMod.dex;
  const magic = classMagic + raceMod.magic;
  
  // Calculate derived stats (HP = VIT * 10, MANA = MAGIC * 10)
  const baseHp = (vit * 10) + (classTemplate.growth.hp * levelOffset);
  const baseMana = (magic * 10) + (classTemplate.growth.mana * levelOffset);
  
  const hp = baseHp + raceMod.hp;
  const mana = baseMana + raceMod.mana;
  
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
