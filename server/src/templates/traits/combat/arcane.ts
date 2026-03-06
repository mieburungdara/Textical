/**
 * ARCANE Trait Template
 * 
 * Arcane-affinity creatures gain spellVamp - healing from magic damage.
 * Represents creatures with strong magical affinity.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const ARCANE_TRAIT: TraitTemplate = {
  id: UnitTrait.ARCANE,
  name: 'Arcane',
  description: 'Absorbs magical energy. Gains spellVamp from spell damage dealt.',
  category: TraitCategory.COMBAT,
  
  // Auto spell vamp - this is the main benefit
  statBonuses: {
    spellVampBonus: 10,  // Base 10% spell vamp
    magicBonus: 5,        // Extra magic power
  },
  
  // Visual
  icon: '✨',
  color: '#9400D3',
  
  // Rarity
  rarity: 'rare',
  
  stackable: false,
};
