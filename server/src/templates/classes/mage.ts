/**
 * Mage - First Job (Magic)
 * 
 * Wielder of elemental magic
 * Prerequisites: Novice
 */

import { ClassTemplate, JobTier, JobCategory } from '../ClassTemplate.js';

export const mage: ClassTemplate = {
  id: 'mage',
  name: 'Mage',
  jobTier: JobTier.FIRST_JOB,
  jobCategory: JobCategory.MAGIC,
  prerequisiteJob: 'novice',
  
  // Base stats at Level 1
  // HP = VIT * 10 = 6 * 10 = 60
  // Mana = MAG * 10 = 20 * 10 = 200
  baseHp: 60,      // Derived: vit * 10
  baseVit: 6,      // Lower VIT = less HP but faster
  baseAttack: 3,   // STR-based (low)
  baseDefense: 2,  // DEF-based (low)
  baseDex: 25,     // DEX-based (high speed)
  baseMagic: 20,   // INT-based (high magic)
  baseMana: 200,   // Derived: magic * 10
  
  growth: {
    vit: 1,        // +1 VIT per level (+10 HP)
    hp: 0,         // Additional HP growth (now from VIT)
    attack: 0.5,   // +0.5 ATK per level
    defense: 0.3,  // +0.3 DEF per level
    dex: 2,        // +2 DEX per level
    magic: 3,      // +3 MAG per level (+30 Mana)
    mana: 0,       // Additional mana growth (now from MAGIC)
  },
  
  critRateBonus: 8,
  critDamageBonus: 0.5,
  evasionBonus: 5,
  resistanceBonus: 15,
  
  // Grid stats
  attackRange: 4,    // Ranged magic (4 tiles)
  moveRange: 3,      // 3 tiles per move
  minRange: 0,       // Can attack from any range
  
  description: 'Wielder of elemental magic',
  roles: ['magic', 'damage', 'caster'],
};
