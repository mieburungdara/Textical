/**
 * Freeze Status Effect Template
 * 
 * Completely frozen in ice - cannot act, move, cast, OR receive ANY damage.
 * - Source: Ice skills
 * - Type: Control effect + stat buff
 * - Stacks: None (refreshes duration)
 * - Duration: 4 ticks
 * - NOTE: Unlike Stun, unit is COMPLETELY IMMUNE to ALL damage while frozen
 *         No attacks, no DoT, no AOE - nothing can damage a frozen unit
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StatAffected, StackBehavior } from './StatusEffect.js';

export const freeze: StatusEffectTemplate = {
  id: 'freeze',
  name: 'Freeze',
  description: 'Frozen in ice. Cannot act, move, cast, or receive ANY damage. Defense +50%.',
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
  preventsBeingAttacked: true,  // Cannot be attacked
  preventsTargeting: true,     // Cannot be targeted (already covered by canBeTargeted)
  completelyImmune: true,      // Key difference! No damage at all - ice shield
  
  particleEffect: 'ice_crystal',
  soundEffect: 'frozen',
  
  sourceSkill: 'freeze',
};
