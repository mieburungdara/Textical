/**
 * Skeleton Mage
 * 
 * Undead magic user.
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';

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
  
  growth: {
    vit: 1,
    hp: 0,
    attack: 1.2,
    defense: 0.5,
    dex: 1.5,
    magic: 2,
    mana: 20,
  },
  
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
