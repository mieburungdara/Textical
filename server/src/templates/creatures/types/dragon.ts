/**
 * Dragon Type Template
 * 
 * Base stats for dragon-type creatures: dragons, drakes, wyverns, etc.
 */

import { CreatureType, CreatureTypeTemplate, CreatureStatGrowth, CreatureCombatBonuses } from './_base.js';

export const DRAGON_TYPE: CreatureTypeTemplate = {
  type: CreatureType.DRAGON,
  name: 'Dragon',
  
  baseHp: 200,
  baseVit: 20,
  baseAttack: 30,
  baseDefense: 20,
  baseDex: 25,
  baseMagic: 20,
  baseMana: 200,
  
  growth: {
    vit: 3,
    hp: 0,
    attack: 4,
    defense: 3,
    dex: 2,
    magic: 3,
    mana: 25,
  },
  
  bonuses: {
    critRate: 12,
    critDamage: 0.3,
    evasion: 8,
    resistance: 25,
    lifeSteal: 5,
  },
  
  abilities: ['fire_breath', 'claw_slash', 'fly', 'roar'],
  drops: ['dragon_scale', 'dragon_blood', 'dragon_claw'],
  
  description: 'Ancient draconic creature',
};

// ========== VARIANTS ==========

export const DRAGON_WHELP_TYPE: CreatureTypeTemplate = {
  ...DRAGON_TYPE,
  type: CreatureType.DRAGON,
  name: 'Dragon Whelp',
  
  baseHp: 150,
  baseVit: 15,
  baseAttack: 25,
  baseDefense: 15,
  baseDex: 30,
  baseMagic: 15,
  baseMana: 150,
  
  growth: {
    vit: 2,
    hp: 0,
    attack: 3,
    defense: 2,
    dex: 2,
    magic: 2,
    mana: 20,
  },
  
  bonuses: {
    critRate: 10,
    evasion: 10,
    resistance: 20,
  },
  
  drops: ['dragon_scale', 'dragon_egg'],
  description: 'Young dragon learning to use its power',
};

export const ANCIENT_DRAGON_TYPE: CreatureTypeTemplate = {
  ...DRAGON_TYPE,
  type: CreatureType.DRAGON,
  name: 'Ancient Dragon',
  
  baseHp: 2000,
  baseVit: 200,
  baseAttack: 80,
  baseDefense: 60,
  baseDex: 45,
  baseMagic: 70,
  baseMana: 700,
  
  growth: {
    vit: 25,
    hp: 0,
    attack: 12,
    defense: 10,
    dex: 5,
    magic: 10,
    mana: 80,
  },
  
  bonuses: {
    critRate: 30,
    critDamage: 1.0,
    evasion: 20,
    resistance: 60,
    lifeSteal: 15,
  },
  
  abilities: ['world_breaker', 'time_freeze', 'dimension_shift', 'doomsday', 'inferno', 'tail_whip', 'fly', 'roar'],
  drops: ['ancient_scale', 'dragon_king_crest', 'eternal_dragon_egg'],
  description: 'Legendary dragon that predates history',
};
