/**
 * Shield Status Effect Template
 * 
 * Absorbs damage.
 * - Source: Shield skills, magic
 * - Type: Special (damage absorption)
 * - Stacks: Intensity (increases shield amount)
 * - Duration: 5 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const shield: StatusEffectTemplate = {
  id: 'shield',
  name: 'Shield',
  description: 'Absorbs damage. Shield amount increases with stacks.',
  icon: '🛡️',
  color: '#748FFC',
  
  type: StatusEffectType.SHIELD,
  category: StatusEffectCategory.BUFF,
  
  statAffected: StatAffected.HP,
  statValue: 50, // Extra "effective HP"
  
  duration: 5,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.INTENSITY,
  maxStacks: 3,
  
  particleEffect: 'barrier',
  soundEffect: 'shield_up',
  
  sourceSkill: 'shield',
};
