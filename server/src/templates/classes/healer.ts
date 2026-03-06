/**
 * Healer - First Job (Support/Healer)
 * 
 * Divine healer with restoration magic
 * Prerequisites: Novice
 */

import { ClassTemplate, JobTier, JobCategory } from '../ClassTemplate.js';

export const healer: ClassTemplate = {
  id: 'healer',
  name: 'Healer',
  jobTier: JobTier.FIRST_JOB,
  jobCategory: JobCategory.HEALER,
  prerequisiteJob: 'novice',
  
  // Base stats at Level 1
  // HP = VIT * 10 = 7 * 10 = 70
  // Mana = MAG * 10 = 18 * 10 = 180
  baseHp: 70,      // Derived: vit * 10
  baseVit: 7,      // Moderate VIT
  baseAttack: 3,   // Low STR
  baseDefense: 4,  // Low DEF
  baseDex: 20,     // Moderate DEX
  baseMagic: 18,   // High INT (healing magic)
  baseMana: 180,   // Derived: magic * 10
  
  growth: {
    vit: 2,        // +2 VIT per level (+20 HP)
    hp: 0,         // Additional HP growth (now from VIT)
    attack: 0.5,   // +0.5 ATK per level
    defense: 0.8,  // +0.8 DEF per level
    dex: 1.5,      // +1.5 DEX per level
    magic: 2.5,    // +2.5 MAG per level (+25 Mana)
    mana: 0,       // Additional mana growth (now from MAGIC)
  },
  
  critRateBonus: 5,
  critDamageBonus: 0.4,
  evasionBonus: 4,
  resistanceBonus: 12,
  
  // Grid stats
  attackRange: 3,    // Ranged (healing range)
  moveRange: 3,      // 3 tiles per move
  minRange: 0,       // Can heal from any range
  
  description: 'Divine healer with restoration magic',
  roles: ['healer', 'support', 'magic'],
};
