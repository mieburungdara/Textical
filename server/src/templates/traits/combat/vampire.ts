/**
 * VAMPIRE Trait Template
 * 
 * Vampire creatures automatically gain lifeSteal from attacks.
 * Represents creatures that drain life from their victims.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const VAMPIRE_TRAIT: TraitTemplate = {
  id: UnitTrait.VAMPIRE,
  name: 'Vampire',
  description: 'Drains life from enemies on attack. Gains lifeSteal based on damage dealt.',
  category: TraitCategory.COMBAT,
  
  // Auto life steal - this is the main benefit
  statBonuses: {
    lifeStealBonus: 10,  // Base 10% lifesteal
    attackBonus: 2,     // Slight attack bonus for being aggressive
  },
  
  // Special combat effects
  combatEffects: {
    // Undead/vampires get reduced healing from normal sources
    healingReceived: 0.5, // Only 50% healing received (negative effect, but part of the trait package)
  },
  
  // Visual
  icon: '🧛',
  color: '#8B0000',
  
  // Rarity
  rarity: 'rare',
  
  // Not stackable - having multiple vampire traits doesn't double lifesteal
  stackable: false,
};
