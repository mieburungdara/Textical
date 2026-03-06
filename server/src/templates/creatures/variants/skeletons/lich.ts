/**
 * Lich
 * 
 * Boss - Powerful undead mage who traded soul for immortality.
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';
import { ElementType } from '../../../elements/index.js';

export const lich: CreatureTemplate = {
  id: 'lich',
  name: 'Lich',
  creatureType: CreatureType.ABERRATION,
  tier: CreatureTier.TIER_4,
  rank: CreatureRank.BOSS,
  
  // Lich is undead and a boss
  traits: [UnitTrait.UNDEAD, UnitTrait.BOSS],
  
  // Lich is large (more imposing)
  size: SizeCategory.LARGE,
  
  element: ElementType.DARK,
  
  baseHp: 150,
  baseVit: 15,
  baseAttack: 30,
  baseDefense: 20,
  baseDex: 30,
  baseMagic: 40,
  baseMana: 400,
  
  growth: {
    vit: 2,
    hp: 0,
    attack: 4,
    defense: 2,
    dex: 2,
    magic: 5,
    mana: 50,
  },
  
  critRateBonus: 20,
  critDamageBonus: 1.0,
  evasionBonus: 15,
  resistanceBonus: 50,
  
  baseExpReward: 500,
  baseGoldReward: 300,
  
  drops: {
    common: ['bone', 'dark_crystal', 'spellbook', 'coin'],
    uncommon: ['skull', 'magic_orb'],
    rare: ['lich_crown', 'soul_gem'],
    legendary: ['lich_phylactery'],
  },
  
  abilities: ['dark_bolt', 'fireball', 'ice_bolt', 'summon_undead', 'soul_drain', 'immortality'],
  description: 'Powerful undead mage who traded soul for immortality',
  
  equipment: [WeaponType.STAFF],
  
  visuals: {
    sprite: 'skeletons/lich',
    icon: '☠️',
    portrait: 'skeletons/portraits/lich',
    animation: 'skeletons/animations/lich_idle',
    size: 'large',
  },
};
