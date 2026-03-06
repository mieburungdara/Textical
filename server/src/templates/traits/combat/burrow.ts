/**
 * BURROW Trait Template
 * 
 * Underground creatures can move through tunnels.
 * Cannot be attacked while underground.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const BURROW_TRAIT: TraitTemplate = {
  id: UnitTrait.BURROW,
  name: 'Burrow',
  description: 'Can move underground. Can surprise attack from below.',
  category: TraitCategory.COMBAT,
  
  // Stat bonuses
  statBonuses: {
    attackBonus: 5,     // Ambush bonus
    evasionBonus: 10,  // Hard to track
  },
  
  // Special abilities
  combatEffects: {
    burrow: true,       // Can move underground
  },
  
  // Visual
  icon: '🕳️',
  color: '#8B4513',
  
  // Rarity
  rarity: 'uncommon',
  
  stackable: false,
};
