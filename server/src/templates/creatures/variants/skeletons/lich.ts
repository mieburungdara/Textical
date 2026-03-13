/**
 * Lich
 * 
 * Boss - Powerful undead mage who traded soul for immortality.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureTemplate, CreatureType, CreatureTier, CreatureRank, UnitTrait, SizeCategory, CreatureGrowthRates } from '../../CreatureBase.js';
import { WeaponType } from '../../../items/index.js';
import { ElementType } from '../../../elements/index.js';

// Lich growth: boss-level undead mage
const lichGrowth: CreatureGrowthRates = {
  vit: 1.05,     // +5% VIT per level (boss)
  hp: 1.04,      // +4% HP per level
  attack: 1.05,  // +5% ATK per level
  defense: 1.04, // +4% DEF per level
  dex: 1.04,     // +4% DEX per level
  magic: 1.07,   // +7% MAG per level (very high magic)
  mana: 1.07,    // +7% MANA per level
};

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
  
  growth: lichGrowth,
  
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
