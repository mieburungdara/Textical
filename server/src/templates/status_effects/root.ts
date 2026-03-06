/**
 * Root Status Effect Template
 * 
 * Cannot move.
 * - Source: Root skills, earth magic
 * - Type: Control effect
 * - Stacks: Duration (extends duration)
 * - Duration: 4 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StackBehavior } from './StatusEffect.js';

export const root: StatusEffectTemplate = {
  id: 'root',
  name: 'Root',
  description: 'Cannot move or flee. Duration extends with stacks.',
  icon: '🌿',
  color: '#5C7C29',
  
  type: StatusEffectType.ROOT,
  category: StatusEffectCategory.CONTROL,
  
  duration: 4,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 2,
  
  preventsMovement: true,
  
  particleEffect: 'roots',
  soundEffect: 'rooted',
  
  sourceSkill: 'root',
};
