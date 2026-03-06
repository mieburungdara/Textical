/**
 * BOSS Trait Template
 * 
 * Boss units generate more threat and cannot be bypassed.
 * Has increased rewards when defeated.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const BOSS_TRAIT: TraitTemplate = {
  id: UnitTrait.BOSS,
  name: 'Boss',
  description: 'Cannot be bypassed. Generates 2x threat. Increased rewards on defeat.',
  category: TraitCategory.COMBAT,
  
  // Stat bonuses for being a boss
  statBonuses: {
    attackBonus: 10,
    defenseBonus: 10,
    resistanceBonus: 15,
    statusResistanceBonus: 50,  // Very hard to CC
  },
  
  // Special combat effects
  combatEffects: {
    threatMultiplier: 2.0,  // 2x threat generation
  },
  
  // Visual
  icon: '👹',
  color: '#FF4500',
  
  // Rarity
  rarity: 'epic',
  
  stackable: false,
};
