/**
 * Burn Status Effect Template
 * 
 * Fire damage over time.
 * - Source: Fire element attacks
 * - Type: Damage over time (DoT)
 * - Stacks: Intensity (increases damage)
 * - Duration: 10 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const burn: StatusEffectTemplate = {
  id: 'burn',
  name: 'Burn',
  description: 'Takes fire damage each tick. Damage increases with stacks.',
  icon: '🔥',
  color: '#FF6B35',
  
  type: StatusEffectType.DAMAGE_OVER_TIME,
  category: StatusEffectCategory.DOT,
  
  damage: 5,
  statAffected: StatAffected.HP,
  
  duration: 10,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.INTENSITY,
  maxStacks: 5,
  
  particleEffect: 'flame',
  soundEffect: 'fire_damage',
  
  sourceElement: 'fire',
};
