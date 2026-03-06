/**
 * Bleed Status Effect Template
 * 
 * Physical damage over time.
 * - Source: Wind element attacks
 * - Type: Damage over time (DoT)
 * - Stacks: Intensity (increases damage)
 * - Duration: 8 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const bleed: StatusEffectTemplate = {
  id: 'bleed',
  name: 'Bleed',
  description: 'Takes bleeding damage each tick. Damage increases with stacks.',
  icon: '🩸',
  color: '#C92A2A',
  
  type: StatusEffectType.DAMAGE_OVER_TIME,
  category: StatusEffectCategory.DOT,
  
  damage: 3,
  statAffected: StatAffected.HP,
  
  duration: 8,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.INTENSITY,
  maxStacks: 5,
  
  particleEffect: 'wind_slice',
  soundEffect: 'wind_damage',
  
  sourceElement: 'wind',
};
