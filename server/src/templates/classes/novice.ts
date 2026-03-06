/**
 * Novice - Base Class
 * 
 * Beginner adventurer with balanced stats
 * Starting point for all characters
 * 
 * Base Stats (Level 1):
 * - VIT: 10 (determines Max HP = VIT * 10 = 100)
 * - MAG: 10 (determines Max Mana = MAG * 10 = 100)
 * - ATK, DEF, DEX: 10 each
 */

import { ClassTemplate, JobTier, JobCategory } from '../ClassTemplate.js';

export const novice: ClassTemplate = {
  id: 'novice',
  name: 'Novice',
  jobTier: JobTier.NOVICE,
  jobCategory: JobCategory.HYBRID,
  
  // Base stats at Level 1 = 10 for all primary stats
  // HP = VIT * 10 = 10 * 10 = 100
  // Mana = MAG * 10 = 10 * 10 = 100
  baseHp: 100,      // Derived: vit * 10 (kept for backward compatibility)
  baseVit: 10,      // VIT - determines Max HP
  baseAttack: 10,  // STR-based
  baseDefense: 10, // DEF-based
  baseDex: 10,     // DEX-based (speed/evasion)
  baseMagic: 10,   // INT-based (magic)
  baseMana: 100,   // Derived: magic * 10
  
  growth: {
    vit: 2,        // +2 VIT per level (+20 HP)
    hp: 0,         // Additional HP growth (now from VIT)
    attack: 2,    // +2 ATK per level
    defense: 2,   // +2 DEF per level
    dex: 2,       // +2 DEX per level
    magic: 2,     // +2 MAG per level
    mana: 0,      // Additional Mana growth (now from MAGIC)
  },
  
  critRateBonus: 5,
  critDamageBonus: 0.5,
  evasionBonus: 2,
  resistanceBonus: 2,
  
  // Grid stats
  attackRange: 1,    // Melee range (default)
  moveRange: 3,      // 3 tiles per move
  minRange: 0,       // No min range
  
  description: 'Beginner adventurer with balanced stats',
  roles: ['explorer', 'beginner'],
};
