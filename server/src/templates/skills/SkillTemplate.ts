/**
 * Skill Template System
 * 
 * Defines templates for skills with cast time and cast speed properties.
 * Skills have different casting mechanics - some are instant, some take time.
 * 
 * ========== CAST SPEED SYSTEM ==========
 * 
 * - castTime: Base ticks needed to complete cast
 * - castSpeed: Modifier that reduces cast time
 * - Formula: actualCastTime = castTime * (BASE_CAST_SPEED / (unitCastSpeed + castSpeedBonus))
 * 
 * - isChanneling: Skill requires continuous casting
 * - channelInterval: Ticks between channel pulses
 * - interruptible: Can be interrupted by damage
 */

import { ElementType } from '../elements/index.js';

// Re-export ElementType for convenience
export { ElementType };

// ========== SKILL CATEGORY ==========

export enum SkillCategory {
  PHYSICAL = 'physical',     // Melee skills
  MAGIC = 'magic',           // Spell skills
  HEALING = 'healing',       // Heal skills
  BUFF = 'buff',            // Buff skills
  DEBUFF = 'debuff',        // Debuff skills
  UTILITY = 'utility',      // Movement, teleport, etc
  SUMMON = 'summon',        // Summoning skills
  PASSIVE = 'passive',      // Passive skills (no cast)
}

// ========== SKILL TARGET TYPE ==========

export enum SkillTargetType {
  SELF = 'self',           // Target self
  ENEMY = 'enemy',         // Target enemy
  ALLY = 'ally',           // Target ally
  AREA = 'area',           // Area of effect
  ANY = 'any',             // Any target
}

// ========== SKILL TIER ==========

export enum SkillTier {
  BASIC = 1,      // Basic skill
  ADVANCED = 2,   // Advanced skill
  EXPERT = 3,     // Expert skill
  MASTER = 4,     // Master skill
  ULTIMATE = 5,   // Ultimate skill
}

// ========== SKILL EFFECT TYPE ==========

export enum SkillEffectType {
  DAMAGE = 'damage',         // Direct damage
  HEAL = 'heal',            // Direct heal
  DOT = 'dot',              // Damage over time
  HOT = 'hot',              // Heal over time
  BUFF = 'buff',            // Apply buff
  DEBUFF = 'debuff',        // Apply debuff
  SHIELD = 'shield',        // Apply shield
  SUMMON = 'summon',        // Summon entity
  TELEPORT = 'teleport',    // Move target
  STUN = 'stun',            // Stun effect
  SILENCE = 'silence',      // Silence effect
  CUSTOM = 'custom',        // Custom effect
}

// ========== SKILL TEMPLATE ==========

export interface SkillTemplate {
  // Identification
  id: string;
  name: string;
  description: string;
  
  // Category & Type
  category: SkillCategory;
  tier: SkillTier;
  element?: ElementType;
  
  // Cast Properties (CORE - the main feature)
  castTime: number;           // Base ticks to cast (e.g., 20 = 2 seconds at 10 ticks/sec)
  castSpeedBonus?: number;    // Bonus cast speed from this skill
  isChanneling?: boolean;    // Requires continuous casting
  channelInterval?: number;  // Ticks between channel pulses (for channeling skills)
  interruptible?: boolean;   // Can be interrupted by damage (default: true)
  
  // Resource Costs
  manaCost: number;
  hpCost?: number;           // Some skills cost HP
  cooldown?: number;          // Ticks before can use again
  charges?: number;          // Number of uses per battle
  
  // Combat Effects
  effectType: SkillEffectType;
  damageMultiplier?: number; // Multiplier to attack stat
  healAmount?: number;       // Base heal amount
  effectValue?: number;      // Custom effect value (e.g., shield amount)
  effectDuration?: number;   // Duration in ticks for buffs/debuffs
  
  // Target & Range
  targetType: SkillTargetType;
  range: number;             // Range in tiles
  areaOfEffect?: number;     // Radius for AOE skills
  
  // Additional Properties
  requiresWeapon?: string[]; // Required weapon type
  requiresClass?: string[]; // Required job/class
  canCrit?: boolean;        // Can critical hit
  canDodge?: boolean;      // Can be dodged
  
  // Visual/UI
  icon?: string;
  animation?: string;
}

// ========== SKILL LIMITS ==========

export const SKILL_CAST_LIMITS = {
  // Cast time limits (in ticks)
  CAST_TIME: { MIN: 0, MAX: 100 },  // 0 = instant, 100 = 10 seconds
  
  // Cast speed limits
  CAST_SPEED: { MIN: 0, MAX: 200 },  // Higher = faster casting
  
  // Cooldown limits (in ticks)
  COOLDOWN: { MIN: 0, MAX: 500 },
  
  // Mana cost limits
  MANA_COST: { MIN: 0, MAX: 200 },
  
  // Range limits
  RANGE: { MIN: 1, MAX: 20 },
  
  // AOE limits
  AOE: { MIN: 1, MAX: 10 },
};

// Base cast speed reference
export const BASE_CAST_SPEED = 100;

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate actual cast time based on unit's cast speed
 * Formula: actualCastTime = castTime * (BASE_CAST_SPEED / unitCastSpeed)
 * 
 * Higher castSpeed = faster casting (lower actual time)
 * Example:
 * - Unit castSpeed 100, skill castTime 20: 20 * (100/100) = 20 ticks
 * - Unit castSpeed 150, skill castTime 20: 20 * (100/150) = 13 ticks (faster!)
 * - Unit castSpeed 50, skill castTime 20: 20 * (100/50) = 40 ticks (slower)
 */
export function calculateActualCastTime(
  baseCastTime: number,
  unitCastSpeed: number,
  skillCastSpeedBonus: number = 0
): number {
  const totalCastSpeed = Math.max(1, unitCastSpeed + skillCastSpeedBonus);
  return Math.max(0, Math.floor(baseCastTime * (BASE_CAST_SPEED / totalCastSpeed)));
}

/**
 * Calculate channel ticks for channeling skills
 * Returns number of ticks the channel will last
 */
export function calculateChannelDuration(
  baseCastTime: number,
  channelInterval: number
): number {
  if (channelInterval <= 0) return baseCastTime;
  return Math.floor(baseCastTime / channelInterval) * channelInterval;
}

/**
 * Check if a skill can be cast given current resources
 */
export function canCastSkill(
  skill: SkillTemplate,
  currentHp: number,
  currentMana: number,
  onCooldown: boolean
): { canCast: boolean; reason?: string } {
  // Check cooldown
  if (onCooldown) {
    return { canCast: false, reason: 'Skill is on cooldown' };
  }
  
  // Check HP cost
  if (skill.hpCost && currentHp < skill.hpCost) {
    return { canCast: false, reason: 'Not enough HP' };
  }
  
  // Check mana cost
  if (currentMana < skill.manaCost) {
    return { canCast: false, reason: 'Not enough mana' };
  }
  
  return { canCast: true };
}
