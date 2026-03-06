/**
 * Skill Templates Index
 * 
 * Central export for all skill templates.
 * Each skill is in its own file for easier testing and maintenance.
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType, calculateActualCastTime, canCastSkill, BASE_CAST_SPEED, SKILL_CAST_LIMITS, ElementType } from './SkillTemplate.js';

// Re-export types and functions
export { 
  SkillTemplate, 
  SkillCategory, 
  SkillTargetType, 
  SkillTier, 
  SkillEffectType,
  ElementType,
  calculateActualCastTime,
  canCastSkill,
  BASE_CAST_SPEED,
  SKILL_CAST_LIMITS
} from './SkillTemplate.js';

// Import all skills
import { SLASH_SKILL } from './slash.js';
import { THRUST_SKILL } from './thrust.js';
import { SPIN_SKILL } from './spin.js';
import { POWER_STRIKE_SKILL } from './power_strike.js';

import { FIREBALL_SKILL } from './fireball.js';
import { FLAME_STRIKE_SKILL } from './flame_strike.js';
import { ICE_SHARD_SKILL } from './ice_shard.js';
import { BLIZZARD_SKILL } from './blizzard.js';

import { HEAL_SKILL } from './heal.js';
import { GREATER_HEAL_SKILL } from './greater_heal.js';
import { GROUP_HEAL_SKILL } from './group_heal.js';
import { REGENERATION_SKILL } from './regeneration.js';

import { POWER_UP_SKILL } from './power_up.js';
import { SHIELD_SKILL } from './shield.js';
import { HASTE_SKILL } from './haste.js';

import { POISON_SKILL } from './poison.js';
import { SLOW_SKILL } from './slow.js';
import { SILENCE_SKILL } from './silence.js';

import { ULTIMATE_STRIKE_SKILL } from './ultimate_strike.js';
import { METEOR_SKILL } from './meteor.js';
import { DIVINE_SHIELD_SKILL } from './divine_shield.js';

import { TELEPORT_SKILL } from './teleport.js';
import { BLINK_SKILL } from './blink.js';

// ========== SKILL REGISTRY ==========

/**
 * All skill templates indexed by skill ID
 */
export const SKILL_TEMPLATES: Record<string, SkillTemplate> = {
  // Physical skills
  'slash': SLASH_SKILL,
  'thrust': THRUST_SKILL,
  'spin': SPIN_SKILL,
  'power_strike': POWER_STRIKE_SKILL,
  
  // Magic skills
  'fireball': FIREBALL_SKILL,
  'flame_strike': FLAME_STRIKE_SKILL,
  'ice_shard': ICE_SHARD_SKILL,
  'blizzard': BLIZZARD_SKILL,
  
  // Healing skills
  'heal': HEAL_SKILL,
  'greater_heal': GREATER_HEAL_SKILL,
  'group_heal': GROUP_HEAL_SKILL,
  'regeneration': REGENERATION_SKILL,
  
  // Buff skills
  'power_up': POWER_UP_SKILL,
  'shield': SHIELD_SKILL,
  'haste': HASTE_SKILL,
  
  // Debuff skills
  'poison': POISON_SKILL,
  'slow': SLOW_SKILL,
  'silence': SILENCE_SKILL,
  
  // Ultimate skills
  'ultimate_strike': ULTIMATE_STRIKE_SKILL,
  'meteor': METEOR_SKILL,
  'divine_shield': DIVINE_SHIELD_SKILL,
  
  // Utility skills
  'teleport': TELEPORT_SKILL,
  'blink': BLINK_SKILL,
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get a skill template by ID
 */
export function getSkillTemplate(skillId: string): SkillTemplate | undefined {
  return SKILL_TEMPLATES[skillId];
}

/**
 * Get all skills by category
 */
export function getSkillsByCategory(category: SkillCategory): SkillTemplate[] {
  return Object.values(SKILL_TEMPLATES).filter(skill => skill.category === category);
}

/**
 * Get all skills by tier
 */
export function getSkillsByTier(tier: SkillTier): SkillTemplate[] {
  return Object.values(SKILL_TEMPLATES).filter(skill => skill.tier === tier);
}

/**
 * Calculate actual cast time for a skill given unit's cast speed
 */
export function getActualCastTime(skillId: string, unitCastSpeed: number): number {
  const skill = getSkillTemplate(skillId);
  if (!skill) return 0;
  return calculateActualCastTime(skill.castTime, unitCastSpeed, skill.castSpeedBonus ?? 0);
}
