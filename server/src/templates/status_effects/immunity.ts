/**
 * Immunity Status Effect Templates
 * 
 * These effects grant immunity to specific status effects.
 * - Source: Resistance potions, immunity skills
 * - Type: Special (buff)
 * - Duration: Stacks duration
 */

import { StatusEffectTemplate, StatusEffectType, StatusEffectCategory, StackBehavior } from './StatusEffect.js';

// ========== STUN IMMUNITY ==========

export const immuneStun: StatusEffectTemplate = {
  id: 'immune_stun',
  name: 'Stun Immunity',
  description: 'Grants immunity to Stun and Freeze effects',
  icon: '🛡️',
  color: '#FFD700',
  
  type: StatusEffectType.INVULNERABLE,
  category: StatusEffectCategory.SPECIAL,
  
  duration: 15,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 3,
  
  particleEffect: 'shield',
  soundEffect: 'immunity',
  
  sourceSkill: 'stun_immunity',
};

// ========== POISON IMMUNITY ==========

export const immunePoison: StatusEffectTemplate = {
  id: 'immune_poison',
  name: 'Poison Immunity',
  description: 'Grants immunity to Poison and DoT effects',
  icon: '💚',
  color: '#32CD32',
  
  type: StatusEffectType.INVULNERABLE,
  category: StatusEffectCategory.SPECIAL,
  
  duration: 15,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 3,
  
  particleEffect: 'purify',
  soundEffect: 'immunity',
  
  sourceSkill: 'poison_immunity',
};

// ========== CURSE IMMUNITY ==========

export const immuneCurse: StatusEffectTemplate = {
  id: 'immune_curse',
  name: 'Curse Immunity',
  description: 'Grants immunity to Curse and negative stat effects',
  icon: '🔯',
  color: '#9400D3',
  
  type: StatusEffectType.INVULNERABLE,
  category: StatusEffectCategory.SPECIAL,
  
  duration: 15,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 3,
  
  particleEffect: 'holy',
  soundEffect: 'immunity',
  
  sourceSkill: 'curse_immunity',
};

// ========== SILENCE IMMUNITY ==========

export const immuneSilence: StatusEffectTemplate = {
  id: 'immune_silence',
  name: 'Silence Immunity',
  description: 'Grants immunity to Silence effects',
  icon: '🔊',
  color: '#FF69B4',
  
  type: StatusEffectType.INVULNERABLE,
  category: StatusEffectCategory.SPECIAL,
  
  duration: 15,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.DURATION,
  maxStacks: 3,
  
  particleEffect: 'sound_wave',
  soundEffect: 'immunity',
  
  sourceSkill: 'silence_immunity',
};

// ========== ALL STATUS IMMUNITY ==========

export const immuneAll: StatusEffectTemplate = {
  id: 'immune_all',
  name: 'Status Immunity',
  description: 'Grants immunity to all status effects (except buffs)',
  icon: '⭐',
  color: '#FFFFFF',
  
  type: StatusEffectType.INVULNERABLE,
  category: StatusEffectCategory.SPECIAL,
  
  duration: 10,
  tickInterval: 1,
  
  stackBehavior: StackBehavior.NONE,
  
  particleEffect: 'divine',
  soundEffect: 'divine_blessing',
  
  sourceSkill: 'status_immunity',
};
