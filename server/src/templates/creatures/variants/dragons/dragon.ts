/**
 * Base Dragon
 * 
 * The most basic dragon creature.
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

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
  
  growth: {
    vit: 2,
    hp: 0,
    attack: 3,
    defense: 2,
    dex: 1.5,
    magic: 2,
    mana: 15,
  },
  
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
