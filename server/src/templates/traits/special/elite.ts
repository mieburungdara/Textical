/**
 * ELITE Trait Template
 * 
 * Elite units are stronger than normal but not quite bosses.
 * Has moderate stat bonuses.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const ELITE_TRAIT: TraitTemplate = {
  id: UnitTrait.ELITE,
  name: 'Elite',
  description: 'Stronger than normal units. 1.5x stats and increased threat.',
  category: TraitCategory.SPECIAL,
  
  // Stat bonuses - significant but not boss-level
  statBonuses: {
    attackBonus: 8,
    defenseBonus: 6,
    critRateBonus: 3,
    evasionBonus: 3,
  },
  
  // Special combat effects
  combatEffects: {
    threatMultiplier: 1.3,  // 1.3x threat generation
  },
  
  // Visual
  icon: '⭐',
  color: '#FFD700',
  
  // Rarity
  rarity: 'uncommon',
  
  stackable: false,
};
