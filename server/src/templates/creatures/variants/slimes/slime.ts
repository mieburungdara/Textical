/**
 * Base Slime
 * 
 * The most basic slime creature.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 * Values must be >= 1.0 (1.0 = no change, >1.0 = increase)
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, CreatureVisuals, SizeCategory, CreatureGrowthRates } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

// Exponential growth rates for slimes (slow, weak creatures)
const slimeGrowth: CreatureGrowthRates = {
  vit: 1.02,     // +2% VIT per level
  hp: 1.02,      // +2% HP per level
  attack: 1.03,  // +3% ATK per level
  defense: 1.02, // +2% DEF per level
  dex: 1.02,     // +2% DEX per level
  magic: 1.0,    // No magic (base is 0)
  mana: 1.0,     // No mana (base is 0)
};

export const baseSlime: CreatureTemplate = {
  id: 'base_slime',
  name: 'Slime',
  creatureType: CreatureType.BEAST,
  tier: CreatureTier.TIER_1,
  rank: CreatureRank.NORMAL,
  
  // Slimes are small
  size: SizeCategory.SMALL,
  
  baseHp: 30,
  baseVit: 3,
  baseAttack: 5,
  baseDefense: 2,
  baseDex: 10,
  baseMagic: 0,
  baseMana: 0,
  
  growth: slimeGrowth,
  
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
