/**
 * Dragon Mage
 * 
 * Dragon with magical abilities.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory, CreatureGrowthRates } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

// Dragon mage growth: high magic, elite-level
const dragonMageGrowth: CreatureGrowthRates = {
  vit: 1.04,     // +4% VIT per level
  hp: 1.03,      // +3% HP per level
  attack: 1.04,   // +4% ATK per level
  defense: 1.03, // +3% DEF per level
  dex: 1.04,     // +4% DEX per level
  magic: 1.06,   // +6% MAG per level (high magic)
  mana: 1.06,    // +6% MANA per level
};

export const dragonMage: CreatureTemplate = {
  id: 'dragon_mage',
  name: 'Dragon Mage',
  creatureType: CreatureType.DRAGON,
  tier: CreatureTier.TIER_4,
  rank: CreatureRank.ELITE,
  
  // Dragon mages can fly and are elite
  traits: [UnitTrait.FLY, UnitTrait.ELITE],
  
  // Dragon mages are large
  size: SizeCategory.LARGE,
  
  baseHp: 120,
  baseVit: 12,
  baseAttack: 20,
  baseDefense: 12,
  baseDex: 20,
  baseMagic: 35,
  baseMana: 350,
  
  growth: dragonMageGrowth,
  
  critRateBonus: 10,
  critDamageBonus: 0.6,
  evasionBonus: 8,
  resistanceBonus: 30,
  
  baseExpReward: 200,
  baseGoldReward: 150,
  
  drops: {
    common: ['dragon_scale', 'coin', 'magic_orb'],
    uncommon: ['dragon_heart', 'spellbook'],
    rare: ['dragon_mage_staff'],
    legendary: [],
  },
  
  abilities: ['claw', 'fireball', 'ice_bolt', 'lightning', 'magic_shield'],
  description: 'A dragon skilled in magic',
  
  equipment: [WeaponType.STAFF],
  
  visuals: {
    sprite: 'dragons/dragon_mage',
    icon: '🐉🧙',
    size: 'large',
  },
};
