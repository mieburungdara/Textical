/**
 * FLY Trait Template
 * 
 * Flying units are immune to melee attacks from ground units.
 * Can fly over obstacles and other units.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const FLY_TRAIT: TraitTemplate = {
  id: UnitTrait.FLY,
  name: 'Flying',
  description: 'Immune to melee attacks from ground units. Can fly over obstacles.',
  category: TraitCategory.COMBAT,
  
  // Stat bonuses for being aerial
  statBonuses: {
    evasionBonus: 5,     // Harder to hit while flying
    dexBonus: 2,         // More agile
  },
  
  // Main immunity - cannot be attacked by melee
  immunities: {
    melee: true,        // Immune to melee attacks
  },
  
  // Special abilities
  combatEffects: {
    canFly: true,       // Can move over units
  },
  
  // Visual
  icon: '🦇',
  color: '#4A90D9',
  
  // Rarity
  rarity: 'uncommon',
  
  stackable: false,
};
