/**
 * Haste Status Effect Template
 * 
 * Increased action speed.
 * - Source: Haste skills, speed buffs
 * - Type: Stat buff
 * - Stacks: Duration (extends duration)
 * - Duration: 6 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const haste: StatusEffectTemplate = {
  id: 'haste',
  name: 'Haste',
  description: 'Action speed increased by 30%. Duration extends with stacks.',
  icon: '⚡',
  color: '#FFE066',
  
  type: StatusEffectType.STAT_BUFF,
  category: StatusEffectCategory.BUFF,
  
  statAffected: StatAffected.SPEED,
  statValue: 30,
  
  duration: 6,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 2,
  
  particleEffect: 'speed_lines',
  soundEffect: 'haste',
  
  sourceSkill: 'haste',
};
