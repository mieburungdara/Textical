/**
 * Stun Status Effect Template
 * 
 * Unable to act.
 * - Source: Common (stun skills, attacks)
 * - Type: Control effect
 * - Stacks: None (refreshes duration)
 * - Duration: 3 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StackBehavior } from './StatusEffect.js';

export const stun: StatusEffectTemplate = {
  id: 'stun',
  name: 'Stun',
  description: 'Cannot act. Duration refreshes if stunned again.',
  icon: '💫',
  color: '#FF922B',
  
  type: StatusEffectType.STUN,
  category: StatusEffectCategory.CONTROL,
  
  duration: 3,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.NONE,
  
  preventsAction: true,
  
  particleEffect: 'stars',
  soundEffect: 'stunned',
  
  sourceSkill: 'stun',
};
