/**
 * GHOST Trait Template
 * 
 * Ghost/ethereal creatures are immune to physical damage.
 * Can pass through solid objects.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const GHOST_TRAIT: TraitTemplate = {
  id: UnitTrait.GHOST,
  name: 'Ghost',
  description: 'Immune to physical damage. Can phase through solid objects.',
  category: TraitCategory.COMBAT,
  
  // Stat bonuses
  statBonuses: {
    evasionBonus: 15,    // Very hard to hit
    magicBonus: 5,       // Strong in magical attacks
  },
  
  // Main immunity - physical doesn't affect ghosts
  immunities: {
    physical: true,      // Immune to physical damage
  },
  
  // Special abilities
  combatEffects: {
    // Can move through units (phase)
  },
  
  // Visual
  icon: '👻',
  color: '#9370DB',
  
  // Rarity
  rarity: 'rare',
  
  stackable: false,
};
