/**
 * Invisible Status Effect Template
 * 
 * Unit cannot be targeted by enemies.
 * - Source: Invisibility potion, invisibility skills
 * - Type: Special
 * - NOTE: Unit CAN still take damage from AOE/skills
 * - Duration: Stacks duration
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StackBehavior } from './StatusEffect.js';

export const invisible: StatusEffectTemplate = {
  id: 'invisible',
  name: 'Invisible',
  description: 'Unit cannot be targeted by enemies, but CAN still take damage from AOE/skills',
  icon: '👻',
  color: '#B8B8FF',
  
  type: StatusEffectType.INVISIBLE,
  category: StatusEffectCategory.SPECIAL,
  
  duration: 10,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 3,
  
  preventsTargeting: true,  // Cannot be targeted
  // NOTE: Does NOT prevent AOE damage
  
  particleEffect: 'ghost',
  soundEffect: 'invisibility',
  
  sourceSkill: 'invisibility',
};
