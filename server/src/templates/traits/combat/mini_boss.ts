/**
 * MINI_BOSS Trait Template
 * 
 * Mini-boss units generate 1.5x threat and have moderate bonuses.
 * Easier than full bosses but still dangerous.
 */

import { UnitTrait } from '../../creatures/CreatureBase.js';
import { TraitTemplate, TraitCategory } from '../TraitTemplate.js';

export const MINI_BOSS_TRAIT: TraitTemplate = {
  id: UnitTrait.MINI_BOSS,
  name: 'Mini Boss',
  description: 'Generates 1.5x threat. Stronger than normal enemies.',
  category: TraitCategory.COMBAT,
  
  // Stat bonuses
  statBonuses: {
    attackBonus: 5,
    defenseBonus: 5,
    resistanceBonus: 8,
    statusResistanceBonus: 25,
  },
  
  // Special combat effects
  combatEffects: {
    threatMultiplier: 1.5,  // 1.5x threat generation
  },
  
  // Visual
  icon: '💢',
  color: '#FF6347',
  
  // Rarity
  rarity: 'rare',
  
  stackable: false,
};
