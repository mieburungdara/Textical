/**
 * Base Skeleton
 * 
 * The most basic skeleton creature.
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

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
  
  growth: {
    vit: 1,
    hp: 0,
    attack: 1.8,
    defense: 1,
    dex: 1.5,
    magic: 0,
    mana: 0,
  },
  
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
