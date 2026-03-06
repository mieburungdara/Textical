/**
 * Curse Status Effect Template
 * 
 * Healing reduction.
 * - Source: Dark element attacks
 * - Type: Stat debuff
 * - Stacks: Duration (extends duration)
 * - Duration: 10 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const curse: StatusEffectTemplate = {
  id: 'curse',
  name: 'Curse',
  description: 'Healing received reduced by 50%. Duration extends with stacks.',
  icon: '💀',
  color: '#845EF7',
  
  type: StatusEffectType.STAT_DEBUFF,
  category: StatusEffectCategory.DEBUFF,
  
  statAffected: StatAffected.HEALING,
  statValue: -50,
  
  duration: 10,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 3,
  
  particleEffect: 'shadow',
  soundEffect: 'dark_damage',
  
  sourceElement: 'dark',
};
