/**
 * Wet Status Effect Template
 * 
 * Movement speed reduction.
 * - Source: Water element attacks
 * - Type: Stat debuff
 * - Stacks: Duration (extends duration)
 * - Duration: 8 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const wet: StatusEffectTemplate = {
  id: 'wet',
  name: 'Wet',
  description: 'Movement speed reduced by 30%. Duration extends with stacks.',
  icon: '💧',
  color: '#4DABF7',
  
  type: StatusEffectType.STAT_DEBUFF,
  category: StatusEffectCategory.DEBUFF,
  
  statAffected: StatAffected.SPEED,
  statValue: -30,
  
  duration: 8,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 3,
  
  particleEffect: 'water_splash',
  soundEffect: 'water_damage',
  
  sourceElement: 'water',
};
