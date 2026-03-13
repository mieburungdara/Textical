/**
 * Phased Status Effect Template
 * 
 * Unit can pass through enemies.
 * - Source: Phase shift potion, phase skills
 * - Type: Special
 * - NOTE: Unit CAN still take damage from attacks
 * - Duration: Stacks duration
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StackBehavior } from './StatusEffect.js';

export const phased: StatusEffectTemplate = {
  id: 'phased',
  name: 'Phased',
  description: 'Unit can pass through enemies, but CAN still take damage from attacks',
  icon: '👁️',
  color: '#98FB98',
  
  type: StatusEffectType.PHASED,
  category: StatusEffectCategory.SPECIAL,
  
  duration: 8,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 2,
  
  allowsPassThrough: true,  // Can pass through enemies
  // NOTE: Does NOT prevent damage
  
  particleEffect: 'phase_shift',
  soundEffect: 'phase',
  
  sourceSkill: 'phase_shift',
};
