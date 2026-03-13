/**
 * Elemental Type Template
 * 
 * Base stats for elemental creatures: fire elemental, water elemental, etc.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureType, CreatureTypeTemplate, CreatureCombatBonuses, CreatureGrowthRates } from './_base.js';

// Elementals: moderate stats, high magic
const elementalGrowth: CreatureGrowthRates = {
  vit: 1.03,     // +3% VIT per level
  hp: 1.02,      // +2% HP bonus per level
  attack: 1.04,  // +4% ATK per level
  defense: 1.02, // +2% DEF per level
  dex: 1.04,     // +4% DEX per level
  magic: 1.05,   // +5% MAG per level (magic users)
  mana: 1.05,    // +5% MANA per level
};

export const ELEMENTAL_TYPE: CreatureTypeTemplate = {
  type: CreatureType.ELEMENTAL,
  name: 'Elemental',
  
  baseHp: 70,
  baseVit: 7,
  baseAttack: 20,
  baseDefense: 6,
  baseDex: 20,
  baseMagic: 15,
  baseMana: 150,
  
  growth: elementalGrowth,
  
  bonuses: {
    critRate: 10,
    evasion: 8,
    resistance: 15,
  },
  
  abilities: [],
  drops: ['elemental_essence'],
  
  description: 'Embodiment of elemental forces',
};

// ========== VARIANTS ==========

// Fire Elemental: high attack, fire resistance
export const FIRE_ELEMENTAL_TYPE: CreatureTypeTemplate = {
  ...ELEMENTAL_TYPE,
  type: CreatureType.ELEMENTAL,
  name: 'Fire Elemental',
  
  baseHp: 70,
  baseVit: 7,
  baseAttack: 22,
  baseDefense: 6,
  baseDex: 25,
  baseMagic: 15,
  baseMana: 150,
  
  growth: {
    vit: 1.03,    // +3% VIT per level
    hp: 1.02,     // +2% HP per level
    attack: 1.05, // +5% ATK per level (high damage)
    defense: 1.02, // +2% DEF per level
    dex: 1.04,    // +4% DEX per level
    magic: 1.05,  // +5% MAG per level
    mana: 1.05,   // +5% MANA per level
  },
  
  bonuses: {
    critRate: 10,
    evasion: 8,
    resistance: 20,
  },
  
  abilities: ['fireball', 'flame_touch', 'combustion'],
  drops: ['fire_essence', 'flame_core'],
  description: 'Embodiment of fire',
};

// Water Elemental: high magic, tanky
export const WATER_ELEMENTAL_TYPE: CreatureTypeTemplate = {
  ...ELEMENTAL_TYPE,
  type: CreatureType.ELEMENTAL,
  name: 'Water Elemental',
  
  baseHp: 80,
  baseVit: 8,
  baseAttack: 18,
  baseDefense: 8,
  baseDex: 20,
  baseMagic: 18,
  baseMana: 180,
  
  growth: {
    vit: 1.04,    // +4% VIT per level (tanky)
    hp: 1.03,     // +3% HP per level
    attack: 1.04, // +4% ATK per level
    defense: 1.03, // +3% DEF per level
    dex: 1.04,    // +4% DEX per level
    magic: 1.05,  // +5% MAG per level
    mana: 1.06,   // +6% MANA per level (high mana)
  },
  
  bonuses: {
    critRate: 8,
    evasion: 6,
    resistance: 25,
  },
  
  abilities: ['water_bolt', 'aqua_shield', 'tsunami'],
  drops: ['water_essence', 'pearl'],
  description: 'Embodiment of water',
};

// Earth Elemental: very tanky, high defense
export const EARTH_ELEMENTAL_TYPE: CreatureTypeTemplate = {
  ...ELEMENTAL_TYPE,
  type: CreatureType.ELEMENTAL,
  name: 'Earth Elemental',
  
  baseHp: 120,
  baseVit: 12,
  baseAttack: 25,
  baseDefense: 15,
  baseDex: 10,
  baseMagic: 10,
  baseMana: 100,
  
  growth: {
    vit: 1.05,    // +5% VIT per level (very tanky)
    hp: 1.04,     // +4% HP per level
    attack: 1.04, // +4% ATK per level
    defense: 1.05, // +5% DEF per level (very defensive)
    dex: 1.02,    // +2% DEX per level (slow)
    magic: 1.03,  // +3% MAG per level
    mana: 1.03,   // +3% MANA per level
  },
  
  bonuses: {
    critRate: 5,
    evasion: 2,
    damageReduction: 10,
  },
  
  abilities: ['rock_throw', 'earthquake', 'tremor'],
  drops: ['earth_essence', 'gemstone'],
  description: 'Embodiment of earth',
};

// Wind Elemental: very fast, high evasion
export const WIND_ELEMENTAL_TYPE: CreatureTypeTemplate = {
  ...ELEMENTAL_TYPE,
  type: CreatureType.ELEMENTAL,
  name: 'Wind Elemental',
  
  baseHp: 50,
  baseVit: 5,
  baseAttack: 18,
  baseDefense: 3,
  baseDex: 35,
  baseMagic: 12,
  baseMana: 120,
  
  growth: {
    vit: 1.02,    // +2% VIT per level (fragile)
    hp: 1.01,     // +1% HP per level
    attack: 1.04, // +4% ATK per level
    defense: 1.01, // +1% DEF per level (fragile)
    dex: 1.06,    // +6% DEX per level (very fast)
    magic: 1.04,  // +4% MAG per level
    mana: 1.04,   // +4% MANA per level
  },
  
  bonuses: {
    critRate: 15,
    evasion: 20,
    resistance: 10,
  },
  
  abilities: ['wind_slice', 'gust', 'tornado'],
  drops: ['wind_essence', 'feather'],
  description: 'Embodiment of wind',
};
