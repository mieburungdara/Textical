/**
 * MECHANICAL Trait Template
 * 
 * Mechanical units (golems, robots) are immune to poison and mind effects.
 * Often weak to lightning.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const MECHANICAL_TRAIT: TraitTemplate = {
  id: UnitTrait.MECHANICAL,
  name: 'Mechanical',
  description: 'Immune to poison and mind effects. Cannot be healed normally.',
  category: TraitCategory.COMBAT,
  
  // Stat bonuses
  statBonuses: {
    defenseBonus: 8,
    resistanceBonus: 10,
  },
  
  // Main immunities
  immunities: {
    poison: true,        // Immune to poison
    mind: true,         // Immune to mind effects
  },
  
  // Special combat effects
  combatEffects: {
    // Can be repaired instead of healed
  },
  
  // Visual
  icon: '⚙️',
  color: '#708090',
  
  // Rarity
  rarity: 'uncommon',
  
  stackable: false,
};
