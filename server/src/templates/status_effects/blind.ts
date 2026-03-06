/**
 * Blind Status Effect Template
 * 
 * Accuracy reduction.
 * - Source: Light element attacks
 * - Type: Stat debuff
 * - Stacks: Duration (extends duration)
 * - Duration: 6 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const blind: StatusEffectTemplate = {
  id: 'blind',
  name: 'Blind',
  description: 'Accuracy reduced by 40%. Duration extends with stacks.',
  icon: '👁️',
  color: '#FFE066',
  
  type: StatusEffectType.STAT_DEBUFF,
  category: StatusEffectCategory.DEBUFF,
  
  statAffected: StatAffected.ACCURACY,
  statValue: -40,
  
  duration: 6,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 3,
  
  particleEffect: 'holy_light',
  soundEffect: 'light_damage',
  
  sourceElement: 'light',
};
