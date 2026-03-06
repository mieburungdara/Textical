/**
 * Fire Slime
 * 
 * Elemental slime with fire properties.
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';
import { ElementType } from '../../../elements/index.js';

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
  
  growth: {
    vit: 1,
    hp: 0,
    attack: 0.9,
    defense: 0.4,
    dex: 1,
    magic: 0.8,
    mana: 5,
  },
  
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
