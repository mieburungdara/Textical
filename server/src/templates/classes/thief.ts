/**
 * Thief - First Job (Physical/Evasion)
 * 
 * Agile assassin with high critical strikes
 * Prerequisites: Novice
 */

import { ClassTemplate, JobTier, JobCategory } from '../ClassTemplate.js';

export const thief: ClassTemplate = {
  id: 'thief',
  name: 'Thief',
  jobTier: JobTier.FIRST_JOB,
  jobCategory: JobCategory.PHYSICAL,
  prerequisiteJob: 'novice',
  
  // Base stats at Level 1
  // HP = VIT * 10 = 7 * 10 = 70
  // Mana = MAG * 10 = 0 * 10 = 0 (no magic)
  baseHp: 70,      // Derived: vit * 10
  baseVit: 7,      // Moderate VIT
  baseAttack: 14, // High STR-based
  baseDefense: 2, // Very low DEF
  baseDex: 45,    // Very high DEX (speed/evasion)
  baseMagic: 0,   // No magic
  baseMana: 0,    // Derived: magic * 10
  
  growth: {
    vit: 2,        // +2 VIT per level (+20 HP)
    hp: 0,         // Additional HP growth (now from VIT)
    attack: 1.8,   // +1.8 ATK per level
    defense: 0.3, // +0.3 DEF per level
    dex: 4,        // +4 DEX per level
    magic: 0,      // No magic growth
    mana: 0,       // No mana growth
  },
  
  critRateBonus: 20,
  critDamageBonus: 0.8,
  evasionBonus: 15,
  resistanceBonus: 2,
  
  // Grid stats
  attackRange: 1,    // Melee range
  moveRange: 5,      // 5 tiles per move (very agile)
  minRange: 0,       // No min range
  
  description: 'Agile assassin with high critical strikes',
  roles: ['melee', 'assassin', 'evasion'],
};
