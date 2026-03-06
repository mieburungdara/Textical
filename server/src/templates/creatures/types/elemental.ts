/**
 * Elemental Type Template
 * 
 * Base stats for elemental creatures: fire elemental, water elemental, etc.
 */

import { CreatureType, CreatureTypeTemplate, CreatureStatGrowth, CreatureCombatBonuses } from './_base.js';

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
  
  growth: {
    vit: 1,
    hp: 8,
    attack: 2.5,
    defense: 0.8,
    dex: 2,
    magic: 2,
    mana: 15,
  },
  
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
    vit: 1,
    hp: 8,
    attack: 2.5,
    defense: 0.8,
    dex: 2,
    magic: 2,
    mana: 15,
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
    vit: 1,
    hp: 10,
    attack: 2,
    defense: 1,
    dex: 2,
    magic: 2.5,
    mana: 20,
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
    vit: 2,
    hp: 15,
    attack: 3,
    defense: 2,
    dex: 1,
    magic: 1,
    mana: 10,
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
    vit: 1,
    hp: 5,
    attack: 2,
    defense: 0.5,
    dex: 3,
    magic: 1.5,
    mana: 12,
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
