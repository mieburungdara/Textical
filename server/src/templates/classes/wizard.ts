/**
 * Wizard - Second Job (Magic)
 * 
 * Master of arcane arts
 * Prerequisites: Mage
 */

import { ClassTemplate, JobTier, JobCategory } from '../ClassTemplate.js';

export const wizard: ClassTemplate = {
  id: 'wizard',
  name: 'Wizard',
  jobTier: JobTier.SECOND_JOB,
  jobCategory: JobCategory.MAGIC,
  prerequisiteJob: 'mage',
  
  // Base stats at Level 1
  // HP = VIT * 10 = 7 * 10 = 70
  // Mana = MAG * 10 = 35 * 10 = 350
  baseHp: 70,      // Derived: vit * 10
  baseVit: 7,      // Low VIT (squishy caster)
  baseAttack: 5,   // Low STR
  baseDefense: 4,   // Low DEF
  baseDex: 35,     // Very high DEX (speed)
  baseMagic: 35,   // Very high INT (arcane power)
  baseMana: 350,   // Derived: magic * 10
  
  growth: {
    vit: 2,        // +2 VIT per level (+20 HP)
    hp: 0,         // Additional HP growth (now from VIT)
    attack: 1,     // +1 ATK per level
    defense: 0.5,  // +0.5 DEF per level
    dex: 3,        // +3 DEX per level
    magic: 4.5,    // +4.5 MAG per level (+45 Mana)
    mana: 0,       // Additional mana growth (now from MAGIC)
  },
  
  critRateBonus: 10,
  critDamageBonus: 0.6,
  evasionBonus: 6,
  resistanceBonus: 20,
  
  // Grid stats
  attackRange: 5,    // Long range magic (5 tiles)
  moveRange: 3,      // 3 tiles per move
  minRange: 0,       // Can cast from any range
  
  description: 'Master of arcane arts',
  roles: ['magic', 'damage', 'caster'],
};
