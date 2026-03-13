/**
 * Status Effects Registry
 * 
 * Central registry for all status effect templates.
 * Import individual effects here and they will be registered
 * in the main REGISTRY.
 * 
 * Usage:
 *   import { getStatusEffect, getAllStatusEffects } from './status_effects/index.js';
 */

import { 
  StatusEffectTemplate, 
  REGISTRY,
  StatusEffectCategory,
  StatusEffectType,
  StatAffected,
  StackBehavior,
  StatusEffectInstance,
  StatusEffectData,
  createStatusEffectInstance,
  applyStatusEffect,
  tickStatusEffects,
  hasStatusEffect,
  getStatusEffectsByCategory,
  canAct,
  canCast,
  getStatusEffect,
  getAllStatusEffects,
  getStatusEffectsByCategoryType,
  // Immunity system
  isImmuneTo,
  canBeTargeted,
  canBeAttacked,
  isCompletelyImmune,
  canPassThrough,
  
  // Dispel system
  removeStatusEffect,
  dispelByCategory,
  dispelDebuffs,
  dispelBuffs,
  dispelAll,
  hasDebuffs,
  hasBuffs
} from './StatusEffect.js';

// ========== ELEMENT-BASED STATUS EFFECTS ==========

// Fire element - Burn (DoT)
import { burn } from './burn.js';
REGISTRY[burn.id] = burn;

// Water element - Wet (speed debuff)
import { wet } from './wet.js';
REGISTRY[wet.id] = wet;

// Earth element - Heavy (defense debuff)
import { heavy } from './heavy.js';
REGISTRY[heavy.id] = heavy;

// Wind element - Bleed (DoT)
import { bleed } from './bleed.js';
REGISTRY[bleed.id] = bleed;

// Light element - Blind (accuracy debuff)
import { blind } from './blind.js';
REGISTRY[blind.id] = blind;

// Dark element - Curse (healing debuff)
import { curse } from './curse.js';
REGISTRY[curse.id] = curse;

// ========== COMMON STATUS EFFECTS ==========

// Poison (DoT)
import { poison } from './poison.js';
REGISTRY[poison.id] = poison;

// Control effects
import { stun } from './stun.js';
REGISTRY[stun.id] = stun;

import { freeze } from './freeze.js';
REGISTRY[freeze.id] = freeze;

import { sleep } from './sleep.js';
REGISTRY[sleep.id] = sleep;

import { silence } from './silence.js';
REGISTRY[silence.id] = silence;

import { root } from './root.js';
REGISTRY[root.id] = root;

// Buffs/Debuffs
import { regen } from './regen.js';
REGISTRY[regen.id] = regen;

import { shield } from './shield.js';
REGISTRY[shield.id] = shield;

import { haste } from './haste.js';
REGISTRY[haste.id] = haste;

// ========== SPECIAL STATUS EFFECTS ==========

// Invisibility & Phase
import { invisible } from './invisible.js';
REGISTRY[invisible.id] = invisible;

import { phased } from './phased.js';
REGISTRY[phased.id] = phased;

// Immunity
import { immuneStun } from './immunity.js';
REGISTRY[immuneStun.id] = immuneStun;

import { immunePoison } from './immunity.js';
REGISTRY[immunePoison.id] = immunePoison;

import { immuneCurse } from './immunity.js';
REGISTRY[immuneCurse.id] = immuneCurse;

import { immuneSilence } from './immunity.js';
REGISTRY[immuneSilence.id] = immuneSilence;

import { immuneAll } from './immunity.js';
REGISTRY[immuneAll.id] = immuneAll;

// ========== EXPORTS ==========

// Re-export everything from StatusEffect.ts
export {
  StatusEffectTemplate,
  StatusEffectCategory,
  StatusEffectType,
  StatAffected,
  StackBehavior,
  StatusEffectInstance,
  StatusEffectData,
  REGISTRY,
  
  // Factory functions
  createStatusEffectInstance,
  applyStatusEffect,
  tickStatusEffects,
  
  // Query functions
  hasStatusEffect,
  getStatusEffectsByCategory,
  canAct,
  canCast,
  getStatusEffect,
  getAllStatusEffects,
  getStatusEffectsByCategoryType,
  
  // Immunity system
  isImmuneTo,
  canBeTargeted,
  canBeAttacked,
  isCompletelyImmune,
  canPassThrough,
  
  // Dispel system
  removeStatusEffect,
  dispelByCategory,
  dispelDebuffs,
  dispelBuffs,
  dispelAll,
  hasDebuffs,
  hasBuffs,
  
  // Individual templates
  burn,
  wet,
  heavy,
  bleed,
  blind,
  curse,
  poison,
  stun,
  freeze,
  sleep,
  silence,
  root,
  regen,
  shield,
  haste,
  
  // Special
  invisible,
  phased,
  immuneStun,
  immunePoison,
  immuneCurse,
  immuneSilence,
  immuneAll,
};

// ========== CONVENIENCE EXPORTS ==========

/**
 * Get all DoT status effects
 */
export function getAllDoT(): StatusEffectTemplate[] {
  return getStatusEffectsByCategoryType(StatusEffectCategory.DOT);
}

/**
 * Get all HoT status effects  
 */
export function getAllHoT(): StatusEffectTemplate[] {
  return getStatusEffectsByCategoryType(StatusEffectCategory.HOT);
}

/**
 * Get all debuff status effects
 */
export function getAllDebuffs(): StatusEffectTemplate[] {
  return getStatusEffectsByCategoryType(StatusEffectCategory.DEBUFF);
}

/**
 * Get all buff status effects
 */
export function getAllBuffs(): StatusEffectTemplate[] {
  return getStatusEffectsByCategoryType(StatusEffectCategory.BUFF);
}

/**
 * Get all control status effects
 */
export function getAllControls(): StatusEffectTemplate[] {
  return getStatusEffectsByCategoryType(StatusEffectCategory.CONTROL);
}

/**
 * Get status effect by element name
 */
export function getStatusEffectByElement(elementName: string): StatusEffectTemplate | undefined {
  const elementMap: Record<string, string> = {
    fire: 'burn',
    water: 'wet',
    earth: 'heavy',
    wind: 'bleed',
    light: 'blind',
    dark: 'curse',
  };
  
  const effectId = elementMap[elementName.toLowerCase()];
  return effectId ? REGISTRY[effectId] : undefined;
}
