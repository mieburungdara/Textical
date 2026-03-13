/**
 * King Slime
 * 
 * Boss slime - royal ruler of slimes.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory, CreatureGrowthRates } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

// King slime growth: boss-level
const kingSlimeGrowth: CreatureGrowthRates = {
  vit: 1.05,     // +5% VIT per level (boss)
  hp: 1.04,      // +4% HP per level
  attack: 1.05,  // +5% ATK per level
  defense: 1.04, // +4% DEF per level
  dex: 1.04,     // +4% DEX per level
  magic: 1.04,   // +4% MAG per level
  mana: 1.04,    // +4% MANA per level
};

export const kingSlime: CreatureTemplate = {
  id: 'king_slime',
  name: 'King Slime',
  creatureType: CreatureType.BEAST,
  tier: CreatureTier.TIER_3,
  rank: CreatureRank.BOSS,
  
  // King slime is a boss
  traits: [UnitTrait.BOSS],
  
  // King slime is large
  size: SizeCategory.LARGE,
  
  baseHp: 200,
  baseVit: 20,
  baseAttack: 25,
  baseDefense: 15,
  baseDex: 15,
  baseMagic: 10,
  baseMana: 100,
  
  growth: kingSlimeGrowth,
  
  critRateBonus: 10,
  critDamageBonus: 0.6,
  evasionBonus: 8,
  resistanceBonus: 15,
  
  baseExpReward: 500,
  baseGoldReward: 300,
  
  drops: {
    common: ['slime_gel', 'coin', 'royal_jewel'],
    uncommon: ['slime_crown'],
    rare: ['king_slime_mount'],
    legendary: ['slime_throne'],
  },
  
  abilities: ['acid_splash', 'king_slap', 'regeneration', 'call_minions'],
  description: 'Royal slime ruler with command over lesser slimes',
  
  equipment: [WeaponType.FIST],
  
  visuals: {
    sprite: 'slimes/king_slime',
    icon: '👑',
    portrait: 'slimes/portraits/king_slime',
    animation: 'slimes/animations/king_slime_idle',
    size: 'large',
  },
};
