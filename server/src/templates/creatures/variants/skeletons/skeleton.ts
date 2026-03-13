/**
 * Base Skeleton
 * 
 * The most basic skeleton creature.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory, CreatureGrowthRates } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

// Skeleton growth: moderate, balanced
const skeletonGrowth: CreatureGrowthRates = {
  vit: 1.03,     // +3% VIT per level
  hp: 1.02,      // +2% HP per level
  attack: 1.04,  // +4% ATK per level
  defense: 1.03, // +3% DEF per level
  dex: 1.04,     // +4% DEX per level
  magic: 1.0,    // No magic (base is 0)
  mana: 1.0,     // No mana (base is 0)
};

export const baseSkeleton: CreatureTemplate = {
  id: 'base_skeleton',
  name: 'Skeleton',
  creatureType: CreatureType.UNDEAD,
  tier: CreatureTier.TIER_2,
  rank: CreatureRank.NORMAL,
  
  // Skeletons are undead
  traits: [UnitTrait.UNDEAD],
  
  // Skeletons are medium size (human-sized)
  size: SizeCategory.MEDIUM,
  
  baseHp: 55,
  baseVit: 6,
  baseAttack: 14,
  baseDefense: 8,
  baseDex: 20,
  baseMagic: 0,
  baseMana: 0,
  
  growth: skeletonGrowth,
  
  critRateBonus: 5,
  critDamageBonus: 0.4,
  evasionBonus: 5,
  resistanceBonus: 10,  // Undead resistance
  
  baseExpReward: 20,
  baseGoldReward: 12,
  
  drops: {
    common: ['bone', 'coin'],
    uncommon: ['skull'],
    rare: [],
    legendary: [],
  },
  
  abilities: ['bone_club'],
  description: 'Animated skeleton of a fallen warrior',
  
  equipment: [WeaponType.FIST],
  
  visuals: {
    sprite: 'skeletons/skeleton',
    icon: '💀',
    size: 'medium',
  },
};
