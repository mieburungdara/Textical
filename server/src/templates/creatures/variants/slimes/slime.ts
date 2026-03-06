/**
 * Base Slime
 * 
 * The most basic slime creature.
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, CreatureVisuals, SizeCategory } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

export const baseSlime: CreatureTemplate = {
  id: 'base_slime',
  name: 'Slime',
  creatureType: CreatureType.BEAST,
  tier: CreatureTier.TIER_1,
  rank: CreatureRank.NORMAL,
  
  // Slimes are small
  size: SizeCategory.SMALL,
  
  baseHp: 10,  // Reduced to match expected HP formula
  baseVit: 5,
  baseAttack: 5,
  baseDefense: 2,
  baseDex: 10,
  baseMagic: 0,
  baseMana: 0,
  
  growth: {
    vit: 1,
    hp: 0,
    attack: 0.8,
    defense: 0.3,
    dex: 1,
    magic: 0,
    mana: 0,
  },
  
  critRateBonus: 2,
  critDamageBonus: 0.3,
  evasionBonus: 3,
  resistanceBonus: 2,
  
  baseExpReward: 10,
  baseGoldReward: 5,
  
  drops: {
    common: ['slime_gel', 'coin'],
    uncommon: [],
    rare: [],
    legendary: [],
  },
  
  abilities: ['acid_splash'],
  description: 'A simple blob of jelly-like substance',
  
  equipment: [WeaponType.FIST],
  
  visuals: {
    sprite: 'slimes/slime',
    icon: '🟢',
    size: 'small',
  },
};
