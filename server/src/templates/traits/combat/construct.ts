/**
 * CONSTRUCT Trait Template
 * 
 * Construct creatures ( golems, puppets ) are immune to mind effects.
 * Cannot be healed normally, must be repaired.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const CONSTRUCT_TRAIT: TraitTemplate = {
  id: UnitTrait.CONSTRUCT,
  name: 'Construct',
  description: 'Immune to mind effects. Cannot be healed - must be repaired.',
  category: TraitCategory.COMBAT,
  
  // Stat bonuses
  statBonuses: {
    defenseBonus: 10,
    damageReductionBonus: 5,
  },
  
  // Main immunity
  immunities: {
    mind: true,         // Immune to mind effects
    debuffs: false,     // Can still be debuffed (unlike ghost)
  },
  
  // Visual
  icon: '🗿',
  color: '#A9A9A9',
  
  // Rarity
  rarity: 'uncommon',
  
  stackable: false,
};
