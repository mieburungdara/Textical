/**
 * Freeze Status Effect Template
 * 
 * Unable to act, increased defense.
 * - Source: Ice skills
 * - Type: Control effect + stat buff
 * - Stacks: None (refreshes duration)
 * - Duration: 4 ticks
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const freeze: StatusEffectTemplate = {
  id: 'freeze',
  name: 'Freeze',
  description: 'Cannot act. Defense increased by 50% but cannot move or attack.',
  icon: '❄️',
  color: '#74C0FC',
  
  type: StatusEffectType.FREEZE,
  category: StatusEffectCategory.CONTROL,
  
  statAffected: StatAffected.DEF,
  statValue: 50,
  
  duration: 4,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.NONE,
  
  preventsAction: true,
  preventsMovement: true,
  
  particleEffect: 'ice_crystal',
  soundEffect: 'frozen',
  
  sourceSkill: 'freeze',
};
