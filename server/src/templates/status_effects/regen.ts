/**
 * Regen (Regeneration) Status Effect Template
 * 
 * Heal over time.
 * - Source: Heal skills, items
 * - Type: Heal over time (HoT)
 * - Stacks: Intensity (increases heal)
 * - Duration: 10 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const regen: StatusEffectTemplate = {
  id: 'regen',
  name: 'Regen',
  description: 'Restores HP each tick. Heal amount increases with stacks.',
  icon: '💚',
  color: '#40C057',
  
  type: StatusEffectType.HEAL_OVER_TIME,
  category: StatusEffectCategory.HOT,
  
  heal: 5,
  statAffected: StatAffected.HP,
  
  duration: 10,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.INTENSITY,
  maxStacks: 3,
  
  particleEffect: 'healing_particles',
  soundEffect: 'healing',
  
  sourceSkill: 'regen',
};
