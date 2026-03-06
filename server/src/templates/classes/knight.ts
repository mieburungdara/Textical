/**
 * Knight - Second Job (Tank)
 * 
 * Heavily armored defender
 * Prerequisites: Swordsman
 */

import { ClassTemplate, JobTier, JobCategory } from '../ClassTemplate.js';

export const knight: ClassTemplate = {
  id: 'knight',
  name: 'Knight',
  jobTier: JobTier.SECOND_JOB,
  jobCategory: JobCategory.TANK,
  prerequisiteJob: 'swordsman',
  
  // Base stats at Level 1
  // HP = VIT * 10 = 18 * 10 = 180
  // Mana = MAG * 10 = 0 * 10 = 0 (no magic)
  baseHp: 180,     // Derived: vit * 10
  baseVit: 18,     // Very high VIT = lots of HP
  baseAttack: 25,  // High STR-based
  baseDefense: 20, // Very high DEF
  baseDex: 25,     // High DEX
  baseMagic: 0,   // No magic
  baseMana: 0,    // Derived: magic * 10
  
  growth: {
    vit: 5,        // +5 VIT per level (+50 HP)
    hp: 0,         // Additional HP growth (now from VIT)
    attack: 3,     // +3 ATK per level
    defense: 3,    // +3 DEF per level
    dex: 2,        // +2 DEX per level
    magic: 0,      // No magic growth
    mana: 0,       // No mana growth
  },
  
  critRateBonus: 10,
  critDamageBonus: 0.6,
  evasionBonus: 4,
  resistanceBonus: 5,
  
  // Grid stats
  attackRange: 1,    // Melee range
  moveRange: 2,      // 2 tiles per move (heavy armor)
  minRange: 0,       // No min range
  
  description: 'Heavily armored defender',
  roles: ['tank', 'melee', 'defense'],
};
