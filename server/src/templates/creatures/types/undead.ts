/**
 * Undead Type Template
 * 
 * Base stats for undead creatures: skeletons, zombies, ghosts, liches, etc.
 */

import { CreatureType, CreatureTypeTemplate, CreatureStatGrowth, CreatureCombatBonuses } from './_base.js';

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
  
  growth: {
    vit: 1,
    hp: 7,
    attack: 1.5,
    defense: 1,
    dex: 1.2,
    magic: 0.5,
    mana: 5,
  },
  
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
    vit: 1,
    hp: 0,
    attack: 1.8,
    defense: 1,
    dex: 1.5,
    magic: 0,
    mana: 0,
  },
  
  bonuses: {
    critRate: 5,
    evasion: 5,
    resistance: 10,
  },
  
  drops: ['bone', 'skull'],
  description: 'Animated skeleton of a fallen warrior',
};

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
    vit: 1,
    hp: 0,
    attack: 1.5,
    defense: 0.8,
    dex: 0.5,
    magic: 0,
    mana: 0,
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
    vit: 1,
    hp: 0,
    attack: 2,
    defense: 0.3,
    dex: 2.5,
    magic: 1.5,
    mana: 15,
  },
  
  bonuses: {
    critRate: 10,
    evasion: 20,
    resistance: 15,
  },
  
  drops: ['ectoplasm', 'soul_gem'],
  description: 'Ethereal spirit that haunts the living',
};

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
    vit: 1.5,
    hp: 0,
    attack: 3,
    defense: 1.5,
    dex: 2,
    magic: 4,
    mana: 40,
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
