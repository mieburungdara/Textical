/**
 * Base Dragon
 * 
 * The most basic dragon creature.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory, CreatureGrowthRates } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

// Dragon growth: high stats all around
const dragonGrowth: CreatureGrowthRates = {
  vit: 1.04,     // +4% VIT per level
  hp: 1.03,      // +3% HP per level
  attack: 1.05,  // +5% ATK per level
  defense: 1.04, // +4% DEF per level
  dex: 1.04,     // +4% DEX per level
  magic: 1.04,   // +4% MAG per level
  mana: 1.04,    // +4% MANA per level
};

export const baseDragon: CreatureTemplate = {
  id: 'base_dragon',
  name: 'Dragon',
  creatureType: CreatureType.DRAGON,
  tier: CreatureTier.TIER_3,
  rank: CreatureRank.NORMAL,
  
  // Dragons can fly - immune to melee attacks
  traits: [UnitTrait.FLY],
  
  // Dragons are large
  size: SizeCategory.LARGE,
  
  baseHp: 100,
  baseVit: 12,
  baseAttack: 25,
  baseDefense: 15,
  baseDex: 15,
  baseMagic: 15,
  baseMana: 100,
  
  growth: dragonGrowth,
  
  critRateBonus: 8,
  critDamageBonus: 0.5,
  evasionBonus: 5,
  resistanceBonus: 20,
  
  baseExpReward: 100,
  baseGoldReward: 50,
  
  drops: {
    common: ['dragon_scale', 'coin'],
    uncommon: ['dragon_claw'],
    rare: ['dragon_heart'],
    legendary: [],
  },
  
  abilities: ['claw', 'bite', 'fire_breath'],
  description: 'A powerful flying reptile',
  
  equipment: [WeaponType.FIST],  // Claws
  
  visuals: {
    sprite: 'dragons/dragon',
    icon: '🐉',
    size: 'large',
  },
};
