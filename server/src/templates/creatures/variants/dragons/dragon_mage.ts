/**
 * Dragon Mage
 * 
 * Dragon with magical abilities.
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

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
  
  growth: {
    vit: 2,
    hp: 0,
    attack: 2.5,
    defense: 1.5,
    dex: 2,
    magic: 4,
    mana: 40,
  },
  
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
