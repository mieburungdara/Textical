/**
 * Silence Status Effect Template
 * 
 * Cannot cast spells or use skills.
 * - Source: Silence skills, magic
 * - Type: Control effect
 * - Stacks: Duration (extends duration)
 * - Duration: 5 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StackBehavior } from './StatusEffect.js';

export const silence: StatusEffectTemplate = {
  id: 'silence',
  name: 'Silence',
  description: 'Cannot cast spells or use skills. Duration extends with stacks.',
  icon: '🤐',
  color: '#868E96',
  
  type: StatusEffectType.SILENCE,
  category: StatusEffectCategory.CONTROL,
  
  duration: 5,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 2,
  
  preventsCast: true,
  
  particleEffect: 'mute',
  soundEffect: 'silenced',
  
  sourceSkill: 'silence',
};
