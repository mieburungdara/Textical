/**
 * Sleep Status Effect Template
 * 
 * Unable to act, takes extra damage if hit.
 * - Source: Sleep skills, magic
 * - Type: Control effect
 * - Stacks: None (wakes up on damage)
 * - Duration: 5 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StackBehavior } from './StatusEffect.js';

export const sleep: StatusEffectTemplate = {
  id: 'sleep',
  name: 'Sleep',
  description: 'Cannot act. Wakes up if attacked. Takes 1.5x damage when hit.',
  icon: '😴',
  color: '#A5D8FF',
  
  type: StatusEffectType.SLEEP,
  category: StatusEffectCategory.CONTROL,
  
  duration: 5,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.NONE,
  
  preventsAction: true,
  
  particleEffect: 'zzz',
  soundEffect: 'sleeping',
  
  sourceSkill: 'sleep',
};
