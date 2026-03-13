/**
 * Ancient Dragon
 * 
 * Boss - The most powerful dragon.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory, CreatureGrowthRates } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

// Ancient dragon growth: world boss level
const ancientDragonGrowth: CreatureGrowthRates = {
  vit: 1.06,     // +6% VIT per level (world boss)
  hp: 1.05,      // +5% HP per level
  attack: 1.07,  // +7% ATK per level
  defense: 1.06, // +6% DEF per level
  dex: 1.05,     // +5% DEX per level
  magic: 1.06,   // +6% MAG per level
  mana: 1.06,    // +6% MANA per level
};

export const ancientDragon: CreatureTemplate = {
  id: 'ancient_dragon',
  name: 'Ancient Dragon',
  creatureType: CreatureType.DRAGON,
  tier: CreatureTier.TIER_5,
  rank: CreatureRank.WORLD_BOSS,
  
  // Ancient dragons can fly and are bosses
  traits: [UnitTrait.FLY, UnitTrait.BOSS],
  
  // Ancient dragons are giant
  size: SizeCategory.GIANT,
  
  baseHp: 500,
  baseVit: 50,
  baseAttack: 80,
  baseDefense: 50,
  baseDex: 30,
  baseMagic: 60,
  baseMana: 500,
  
  growth: ancientDragonGrowth,
  
  critRateBonus: 20,
  critDamageBonus: 1.0,
  evasionBonus: 15,
  resistanceBonus: 50,
  
  baseExpReward: 5000,
  baseGoldReward: 3000,
  
  drops: {
    common: ['dragon_scale', 'dragon_claw', 'coin'],
    uncommon: ['dragon_heart', 'dragon_blood'],
    rare: ['ancient_dragon_scale', 'dragon_egg'],
    legendary: ['ancient_dragon_soul'],
  },
  
  abilities: ['claw', 'bite', 'fire_breath', 'inferno', 'dragon_roar', 'immortality'],
  description: 'An ancient dragon of tremendous power',
  
  equipment: [WeaponType.FIST],  // Claws
  
  visuals: {
    sprite: 'dragons/ancient_dragon',
    icon: '🐲',
    portrait: 'dragons/portraits/ancient_dragon',
    animation: 'dragons/animations/ancient_dragon_idle',
    size: 'giant',
  },
};
