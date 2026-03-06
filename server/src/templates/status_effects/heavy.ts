/**
 * Heavy Status Effect Template
 * 
 * Defense reduction.
 * - Source: Earth element attacks
 * - Type: Stat debuff
 * - Stacks: Duration (extends duration)
 * - Duration: 10 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const heavy: StatusEffectTemplate = {
  id: 'heavy',
  name: 'Heavy',
  description: 'Defense reduced by 25%. Duration extends with stacks.',
  icon: '🪨',
  color: '#8B5A2B',
  
  type: StatusEffectType.STAT_DEBUFF,
  category: StatusEffectCategory.DEBUFF,
  
  statAffected: StatAffected.DEF,
  statValue: -25,
  
  duration: 10,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 3,
  
  particleEffect: 'rock_impact',
  soundEffect: 'earth_damage',
  
  sourceElement: 'earth',
};
