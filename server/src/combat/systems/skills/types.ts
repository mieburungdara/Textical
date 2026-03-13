/**
 * Skills Types - Conditional Skill Effects System
 * 
 * Part of Flexible Combat System
 * Contains all types and interfaces for conditional skill effects
 */

import { UnitState } from '../../TickCost.js';
import { CombatContext } from '../modifiers/types.js';

/**
 * Condition types for skill effects
 */
export enum ConditionType {
  HP_PERCENT = 'hp_percent',           // Target HP percentage
  ATTACKER_HP_PERCENT = 'attacker_hp_percent', // Attacker HP percentage
  TARGET_HP_PERCENT = 'target_hp_percent',     // Target HP percentage
  TARGET_ALIVE = 'target_alive',       // Target is alive
  TARGET_DEAD = 'target_dead',         // Target is dead
  HAS_STATUS = 'has_status',           // Target has status effect
  LACKS_STATUS = 'lacks_status',      // Target lacks status
  TURN_NUMBER = 'turn_number',        // Current turn number
  TICK_NUMBER = 'tick_number',        // Current tick
  COMBAT_DURATION = 'combat_duration', // Ticks since combat start
  DISTANCE = 'distance',               // Distance to target
  ATTACK_COUNT = 'attack_count',       // Attacks this combat
  CRIT_RECENTLY = 'crit_recently',     // Crit in last N ticks
  HIT_COUNT = 'hit_count',            // Hits this combat
  MISS_COUNT = 'miss_count',          // Misses this combat
  KILL_COUNT = 'kill_count',          // Kills this combat
  IS_FIRST_ACTION = 'is_first_action', // First action this turn
  IS_COUPLED = 'is_coupled',          // Next to ally/enemy
  HP_ABOVE_50 = 'hp_above_50',        // HP > 50%
  HP_BELOW_50 = 'hp_below_50',        // HP < 50%
  MANA_ABOVE_30 = 'mana_above_30',   // Mana > 30%
  MANA_BELOW_30 = 'mana_below_30',    // Mana < 30%
  RANDOM_CHANCE = 'random_chance',    // Random chance
  CUSTOM = 'custom'                   // Custom condition function
}

/**
 * Condition definition
 */
export interface SkillCondition {
  type: ConditionType;
  value?: number;           // For numeric comparisons
  value2?: number;          // For range comparisons
  statusType?: string;      // For status conditions
  customFn?: (context: CombatContext) => boolean; // Custom function
}

/**
 * Skill effect branch
 */
export interface SkillEffectBranch {
  // Condition to trigger this branch
  condition: SkillCondition;
  
  // Effects when condition is met
  effects: SkillEffect[];
  
  // Weight for random selection (for RANDOM_CHANCE)
  weight?: number;
}

/**
 * Skill effect types
 */
export enum SkillEffectType {
  DAMAGE = 'damage',
  HEAL = 'heal',
  DOT = 'dot',
  HOT = 'hot',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  STATUS = 'status',
  TELEPORT = 'teleport',
  SUMMON = 'summon',
  CUSTOM = 'custom'
}

/**
 * Skill effect definition
 */
export interface SkillEffect {
  type: SkillEffectType;
  
  // Base value (can be modified by modifiers)
  value?: number;
  
  // Percentage of attack/stat
  percentOf?: 'attack' | 'max_hp' | 'current_hp' | 'missing_hp' | 'int' | 'custom';
  percentMultiplier?: number;
  
  // Duration for effects
  duration?: number;
  
  // Status effect to apply
  statusType?: string;
  
  // Target (self, target, aoe)
  targetType?: 'self' | 'target' | 'aoe' | 'ally' | 'enemy';
  aoeRadius?: number;
  
  // Custom effect data
  customData?: Record<string, any>;
  
  // Chained effects (effects that trigger after this one)
  chainEffects?: SkillEffect[];
  
  // Conditional sub-effects
  branches?: SkillEffectBranch[];
}

/**
 * Resolved effect with calculated values
 */
export interface ResolvedEffect {
  type: SkillEffectType;
  resolvedValue: number;
  resolvedTargets: UnitState[];
  duration?: number;
  statusType?: string;
  customData?: Record<string, any>;
}

// Re-export type aliases for backwards compatibility
export type ISkillCondition = SkillCondition;
export type ISkillEffect = SkillEffect;
