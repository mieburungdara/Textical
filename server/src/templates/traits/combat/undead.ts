/**
 * UNDEAD Trait Template
 * 
 * Undead creatures are immune to poison and receive reduced healing.
 * Often weak to holy/fire attacks.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const UNDEAD_TRAIT: TraitTemplate = {
  id: UnitTrait.UNDEAD,
  name: 'Undead',
  description: 'Immune to poison. Receives 50% healing from normal sources.',
  category: TraitCategory.COMBAT,
  
  // Stat bonuses for being undead
  statBonuses: {
    resistanceBonus: 5,   // Extra resistance
    damageReductionBonus: 2, // Slight damage reduction
  },
  
  // Main immunity - poison doesn't affect undead
  immunities: {
    poison: true,        // Immune to poison
  },
  
  // Special combat effects
  combatEffects: {
    healingReceived: 0.5, // Only 50% healing from normal sources
    passiveRegen: 1,      // Slight passive regeneration (decay in reverse)
  },
  
  // Visual
  icon: '💀',
  color: '#2E8B57',
  
  // Rarity
  rarity: 'common',
  
  stackable: false,
};
