/**
 * Archer - First Job (Ranged)
 * 
 * Ranged attacker with high accuracy
 * Prerequisites: Novice
 */

import { ClassTemplate, JobTier, JobCategory } from '../ClassTemplate.js';

export const archer: ClassTemplate = {
  id: 'archer',
  name: 'Archer',
  jobTier: JobTier.FIRST_JOB,
  jobCategory: JobCategory.RANGED,
  prerequisiteJob: 'novice',
  
  // Base stats at Level 1
  // HP = VIT * 10 = 7 * 10 = 70
  // Mana = MAG * 10 = 0 * 10 = 0 (no magic)
  baseHp: 70,      // Derived: vit * 10
  baseVit: 7,      // Moderate VIT
  baseAttack: 18, // High STR-based
  baseDefense: 3,  // Low DEF
  baseDex: 35,     // Very high DEX (speed/evasion)
  baseMagic: 0,   // No magic
  baseMana: 0,    // Derived: magic * 10
  
  growth: {
    vit: 2,        // +2 VIT per level (+20 HP)
    hp: 0,         // Additional HP growth (now from VIT)
    attack: 2,     // +2 ATK per level
    defense: 0.5,  // +0.5 DEF per level
    dex: 3,        // +3 DEX per level
    magic: 0,      // No magic growth
    mana: 0,       // No mana growth
  },
  
  critRateBonus: 15,
  critDamageBonus: 0.6,
  evasionBonus: 8,
  resistanceBonus: 2,
  
  // Grid stats
  attackRange: 5,    // Ranged (5 tiles)
  moveRange: 4,      // 4 tiles per move (agile)
  minRange: 2,       // Needs 2+ tiles to attack
  
  description: 'Ranged attacker with high accuracy',
  roles: ['ranged', 'damage'],
};
