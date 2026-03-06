/**
 * AQUATIC Trait Template
 * 
 * Water-dwelling creatures can swim but are weak to lightning.
 * Can move freely in water tiles.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const AQUATIC_TRAIT: TraitTemplate = {
  id: UnitTrait.AQUATIC,
  name: 'Aquatic',
  description: 'Can swim in water. Weak to lightning attacks.',
  category: TraitCategory.COMBAT,
  
  // Stat bonuses
  statBonuses: {
    defenseBonus: 3,
    evasionBonus: 3,
  },
  
  // Special abilities
  combatEffects: {
    canSwim: true,       // Can move in water
  },
  
  // Visual
  icon: '🐟',
  color: '#00CED1',
  
  // Rarity
  rarity: 'common',
  
  stackable: false,
};
