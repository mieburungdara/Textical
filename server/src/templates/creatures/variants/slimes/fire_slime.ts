/**
 * Fire Slime
 * 
 * Elemental slime with fire properties.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, CreatureGrowthRates } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';
import { ElementType } from '../../../elements/index.js';

// Fire slime growth: moderate with magic emphasis
const fireSlimeGrowth: CreatureGrowthRates = {
  vit: 1.03,     // +3% VIT per level
  hp: 1.02,      // +2% HP per level
  attack: 1.04,  // +4% ATK per level
  defense: 1.02, // +2% DEF per level
  dex: 1.03,     // +3% DEX per level
  magic: 1.04,   // +4% MAG per level
  mana: 1.04,    // +4% MANA per level
};

export const fireSlime: CreatureTemplate = {
  id: 'fire_slime',
  name: 'Fire Slime',
  creatureType: CreatureType.BEAST,
  tier: CreatureTier.TIER_2,
  rank: CreatureRank.NORMAL,
  
  element: ElementType.FIRE,
  
  baseHp: 50,
  baseVit: 5,
  baseAttack: 7,
  baseDefense: 3,
  baseDex: 10,
  baseMagic: 5,
  baseMana: 30,
  
  growth: fireSlimeGrowth,
  
  critRateBonus: 3,
  critDamageBonus: 0.4,
  evasionBonus: 3,
  resistanceBonus: 10,  // Fire resistance
  
  baseExpReward: 15,
  baseGoldReward: 8,
  
  drops: {
    common: ['slime_gel', 'coin', 'fire_essence'],
    uncommon: ['flame_core'],
    rare: [],
    legendary: [],
  },
  
  abilities: ['acid_splash', 'fireball', 'flame_touch'],
  description: 'A slime imbued with fire element',
  
  equipment: [WeaponType.FIST],
  
  visuals: {
    sprite: 'slimes/fire_slime',
    icon: '🔥',
    size: 'small',
  },
};
