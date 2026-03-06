/**
 * LEGENDARY Trait Template
 * 
 * Legendary units are the strongest non-boss units.
 * Has very high stat bonuses and special abilities.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const LEGENDARY_TRAIT: TraitTemplate = {
  id: UnitTrait.LEGENDARY,
  name: 'Legendary',
  description: 'The strongest of its kind. 2x stats, 3x threat, and 50% damage reduction.',
  category: TraitCategory.SPECIAL,
  
  // Massive stat bonuses
  statBonuses: {
    attackBonus: 15,
    defenseBonus: 15,
    critRateBonus: 10,
    critDamageBonus: 0.5,  // +50% crit damage
    evasionBonus: 10,
    resistanceBonus: 20,
    damageReductionBonus: 10,
  },
  
  // Special combat effects
  combatEffects: {
    threatMultiplier: 3.0,  // 3x threat generation
  },
  
  // Visual
  icon: '🏆',
  color: '#FF8C00',
  
  // Rarity
  rarity: 'legendary',
  
  stackable: false,
};
