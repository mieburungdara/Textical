/**
 * Skeleton Mage
 * 
 * Undead magic user.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory, CreatureGrowthRates } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

// Skeleton mage growth: high magic emphasis
const skeletonMageGrowth: CreatureGrowthRates = {
  vit: 1.02,     // +2% VIT per level (fragile)
  hp: 1.01,      // +1% HP per level
  attack: 1.03,  // +3% ATK per level
  defense: 1.02, // +2% DEF per level
  dex: 1.04,     // +4% DEX per level
  magic: 1.05,   // +5% MAG per level (magic user)
  mana: 1.05,    // +5% MANA per level
};

export const skeletonMage: CreatureTemplate = {
  id: 'skeleton_mage',
  name: 'Skeleton Mage',
  creatureType: CreatureType.UNDEAD,
  tier: CreatureTier.TIER_2,
  rank: CreatureRank.NORMAL,
  
  // Skeleton mages are undead
  traits: [UnitTrait.UNDEAD],
  
  // Skeleton mages are medium size
  size: SizeCategory.MEDIUM,
  
  baseHp: 40,
  baseVit: 4,
  baseAttack: 10,
  baseDefense: 4,
  baseDex: 22,
  baseMagic: 15,  // +15
  baseMana: 150,
  
  growth: skeletonMageGrowth,
  
  critRateBonus: 8,
  critDamageBonus: 0.4,
  evasionBonus: 8,
  resistanceBonus: 20,
  
  baseExpReward: 25,
  baseGoldReward: 18,
  
  drops: {
    common: ['bone', 'coin', 'mana_potion'],
    uncommon: ['skull', 'spellbook'],
    rare: ['magic_orb'],
    legendary: [],
  },
  
  abilities: ['bone_club', 'fireball', 'ice_bolt', 'lightning'],
  description: 'Undead mage wielding dark magic',
  
  equipment: [WeaponType.STAFF],
  
  visuals: {
    sprite: 'skeletons/skeleton_mage',
    icon: '🧙',
    size: 'medium',
  },
};
