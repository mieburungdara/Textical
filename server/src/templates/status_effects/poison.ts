/**
 * Poison Status Effect Template
 * 
 * Toxic damage over time.
 * - Source: Common (poison skills, toxic enemies)
 * - Type: Damage over time (DoT)
 * - Stacks: Intensity (increases damage)
 * - Duration: 12 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const poison: StatusEffectTemplate = {
  id: 'poison',
  name: 'Poison',
  description: 'Takes toxic damage each tick. Damage increases with stacks.',
  icon: '☠️',
  color: '#51CF66',
  
  type: StatusEffectType.DAMAGE_OVER_TIME,
  category: StatusEffectCategory.DOT,
  
  damage: 4,
  statAffected: StatAffected.HP,
  
  duration: 12,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.INTENSITY,
  maxStacks: 5,
  
  particleEffect: 'toxic_cloud',
  soundEffect: 'poison_damage',
  
  sourceSkill: 'poison',
};
