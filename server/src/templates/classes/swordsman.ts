/**
 * Swordsman - First Job (Physical)
 * 
 * Master of sword combat
 * Prerequisites: Novice
 */

import { ClassTemplate, JobTier, JobCategory } from '../ClassTemplate.js';

export const swordsman: ClassTemplate = {
  id: 'swordsman',
  name: 'Swordsman',
  jobTier: JobTier.FIRST_JOB,
  jobCategory: JobCategory.PHYSICAL,
  prerequisiteJob: 'novice',
  
  // Base stats at Level 1
  // HP = VIT * 10 = 12 * 10 = 120
  // Mana = MAG * 10 = 0 * 10 = 0 (no magic)
  baseHp: 120,     // Derived: vit * 10
  baseVit: 12,     // Higher VIT = more HP
  baseAttack: 15,  // STR-based
  baseDefense: 8, // DEF-based
  baseDex: 20,     // DEX-based (speed/evasion)
  baseMagic: 0,   // No magic
  baseMana: 0,    // Derived: magic * 10
  
  growth: {
    vit: 3,        // +3 VIT per level (+30 HP)
    hp: 0,         // Additional HP growth (now from VIT)
    attack: 2.5,  // +2.5 ATK per level
    defense: 1.5, // +1.5 DEF per level
    dex: 3,        // +3 DEX per level - physical DPS needs more DEX
    magic: 0,      // No magic growth
    mana: 0,       // No mana growth
  },
  
  critRateBonus: 8,
  critDamageBonus: 0.5,
  evasionBonus: 3,
  resistanceBonus: 3,
  
  // Grid stats
  attackRange: 1,    // Melee range
  moveRange: 3,      // 3 tiles per move
  minRange: 0,       // No min range
  
  description: 'Master of sword combat',
  roles: ['melee', 'damage'],
};
