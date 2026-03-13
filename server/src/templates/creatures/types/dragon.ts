/**
 * Dragon Type Template
 * 
 * Base stats for dragon-type creatures: dragons, drakes, wyverns, etc.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureType, CreatureTypeTemplate, CreatureCombatBonuses, CreatureGrowthRates } from './_base.js';

// Dragons: very high stats all around, strongest creature type
const dragonGrowth: CreatureGrowthRates = {
  vit: 1.05,     // +5% VIT per level (tanky)
  hp: 1.04,      // +4% HP bonus per level
  attack: 1.06,  // +6% ATK per level (high damage)
  defense: 1.05, // +5% DEF per level
  dex: 1.04,     // +4% DEX per level
  magic: 1.05,   // +5% MAG per level
  mana: 1.05,    // +5% MANA per level
};

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
  
  growth: dragonGrowth,
  
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

// Dragon Whelp: younger, less stats but faster
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
    vit: 1.04,    // +4% VIT per level
    hp: 1.03,     // +3% HP per level
    attack: 1.05, // +5% ATK per level
    defense: 1.04, // +4% DEF per level
    dex: 1.05,    // +5% DEX per level (faster than adults)
    magic: 1.04,  // +4% MAG per level
    mana: 1.04,   // +4% MANA per level
  },
  
  bonuses: {
    critRate: 10,
    evasion: 10,
    resistance: 20,
  },
  
  drops: ['dragon_scale', 'dragon_egg'],
  description: 'Young dragon learning to use its power',
};

// Ancient Dragon: world boss level
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
    vit: 1.08,    // +8% VIT per level (massive)
    hp: 1.06,     // +6% HP per level
    attack: 1.08, // +8% ATK per level (massive)
    defense: 1.07, // +7% DEF per level
    dex: 1.05,    // +5% DEX per level
    magic: 1.07,  // +7% MAG per level
    mana: 1.07,   // +7% MANA per level
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
