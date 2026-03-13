/**
 * Undead Type Template
 * 
 * Base stats for undead creatures: skeletons, zombies, ghosts, liches, etc.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureType, CreatureTypeTemplate, CreatureCombatBonuses, CreatureGrowthRates } from './_base.js';

// Undead: high HP, moderate attack, magic growth
const undeadGrowth: CreatureGrowthRates = {
  vit: 1.04,     // +4% VIT per level (tanky)
  hp: 1.03,      // +3% HP bonus per level
  attack: 1.04,  // +4% ATK per level
  defense: 1.03, // +3% DEF per level
  dex: 1.03,     // +3% DEX per level
  magic: 1.05,   // +5% MAG per level
  mana: 1.05,    // +5% MANA per level
};

export const UNDEAD_TYPE: CreatureTypeTemplate = {
  type: CreatureType.UNDEAD,
  name: 'Undead',
  
  baseHp: 55,
  baseVit: 6,
  baseAttack: 12,
  baseDefense: 7,
  baseDex: 15,
  baseMagic: 5,
  baseMana: 50,
  
  growth: undeadGrowth,
  
  bonuses: {
    critRate: 5,
    critDamage: 0.2,
    resistance: 10,
    lifeSteal: 2,
  },
  
  abilities: [],
  drops: ['bone', 'skull', 'rotten_flesh'],
  
  description: 'Undead creature immune to poison',
};

// ========== VARIANTS ==========

// Skeleton: balanced warrior type
export const SKELETON_TYPE: CreatureTypeTemplate = {
  ...UNDEAD_TYPE,
  type: CreatureType.UNDEAD,
  name: 'Skeleton',
  
  baseHp: 55,
  baseVit: 6,
  baseAttack: 14,
  baseDefense: 8,
  baseDex: 20,
  
  growth: {
    vit: 1.03,    // +3% VIT per level
    hp: 1.02,     // +2% HP per level
    attack: 1.05, // +5% ATK per level
    defense: 1.03, // +3% DEF per level
    dex: 1.04,    // +4% DEX per level
    magic: 1.02,  // +2% MAG per level
    mana: 1.03,   // +3% MANA per level
  },
  
  bonuses: {
    critRate: 5,
    evasion: 5,
    resistance: 10,
  },
  
  drops: ['bone', 'skull'],
  description: 'Animated skeleton of a fallen warrior',
};

// Zombie: very tanky, slow, high life steal
export const ZOMBIE_TYPE: CreatureTypeTemplate = {
  ...UNDEAD_TYPE,
  type: CreatureType.UNDEAD,
  name: 'Zombie',
  
  baseHp: 60,
  baseVit: 6,
  baseAttack: 12,
  baseDefense: 5,
  baseDex: 8,
  
  growth: {
    vit: 1.05,    // +5% VIT per level (very tanky)
    hp: 1.04,     // +4% HP per level
    attack: 1.04, // +4% ATK per level
    defense: 1.03, // +3% DEF per level
    dex: 1.02,    // +2% DEX per level (slow)
    magic: 1.0,   // No magic
    mana: 1.0,    // No mana
  },
  
  bonuses: {
    critRate: 2,
    evasion: 0,
    resistance: 5,
    lifeSteal: 5,
  },
  
  drops: ['rotten_flesh'],
  description: 'Undead monster infected with disease',
};

// Ghost: very fast, high magic, ethereal
export const GHOST_TYPE: CreatureTypeTemplate = {
  ...UNDEAD_TYPE,
  type: CreatureType.SPIRIT,
  name: 'Ghost',
  
  baseHp: 30,
  baseVit: 3,
  baseAttack: 15,
  baseDefense: 2,
  baseDex: 25,
  baseMagic: 10,
  baseMana: 100,
  
  growth: {
    vit: 1.02,    // +2% VIT per level (fragile)
    hp: 1.01,     // +1% HP per level
    attack: 1.05, // +5% ATK per level
    defense: 1.01, // +1% DEF per level (ethereal)
    dex: 1.06,    // +6% DEX per level (fast)
    magic: 1.06,  // +6% MAG per level (magic user)
    mana: 1.06,   // +6% MANA per level
  },
  
  bonuses: {
    critRate: 10,
    evasion: 20,
    resistance: 15,
  },
  
  drops: ['ectoplasm', 'soul_gem'],
  description: 'Ethereal spirit that haunts the living',
};

// Lich: boss-level undead mage
export const LICH_TYPE: CreatureTypeTemplate = {
  ...UNDEAD_TYPE,
  type: CreatureType.ABERRATION,
  name: 'Lich',
  
  baseHp: 100,
  baseVit: 10,
  baseAttack: 20,
  baseDefense: 12,
  baseDex: 25,
  baseMagic: 35,
  baseMana: 350,
  
  growth: {
    vit: 1.05,    // +5% VIT per level (boss-level)
    hp: 1.04,     // +4% HP per level
    attack: 1.06, // +6% ATK per level
    defense: 1.04, // +4% DEF per level
    dex: 1.04,    // +4% DEX per level
    magic: 1.08,  // +8% MAG per level (very high magic growth)
    mana: 1.08,   // +8% MANA per level
  },
  
  bonuses: {
    critRate: 20,
    critDamage: 0.5,
    evasion: 15,
    resistance: 40,
    lifeSteal: 10,
  },
  
  drops: ['dark_crystal', 'spellbook', 'lich_phylactery'],
  description: 'Powerful undead mage who traded soul for immortality',
};
