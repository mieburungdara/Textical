/**
 * Modifier Types - Action Modifier Plugin System
 * 
 * Part of Flexible Combat System
 * This file contains all types and interfaces for the action modifier system
 */

import { UnitState, CombatAction } from '../../TickCost.js';

/**
 * Action types that can be modified
 */
export enum ActionType {
  MOVE = 'move',
  ATTACK = 'attack',
  SKILL = 'skill',
  ITEM = 'item',
  DEFEND = 'defend',
  CAST = 'cast',
  CHARGE = 'charge',
  DASH = 'dash',
  PARRY = 'parry',
  CHANNEL = 'channel',
  COMBO = 'combo'
}

/**
 * Modifier types - Kept for documentation purposes only.
 * In this system, modifiers are defined by their function signatures rather than this enum.
 * @deprecated This enum is not used in the current implementation
 */
export enum ModifierType {
  TICK_COST = 'tick_cost',      // Modify action timing
  DAMAGE = 'damage',             // Modify damage dealt
  HEAL = 'heal',               // Modify healing done
  COST = 'cost',                // Modify resource cost
  RANGE = 'range',             // Modify range
  CRIT_CHANCE = 'crit_chance', // Modify critical chance
  CRIT_DMG = 'crit_dmg',       // Modify critical damage
  HIT_CHANCE = 'hit_chance',   // Modify hit chance
  EVASION = 'evasion',         // Modify evasion
  COOLDOWN = 'cooldown',       // Modify skill cooldown
  CUSTOM = 'custom'            // Custom modifier
}

/**
 * Condition for modifier activation
 */
export interface ModifierCondition {
  sourceUnit?: (unit: UnitState) => boolean;
  targetUnit?: (unit: UnitState) => boolean;
  combatContext?: (context: CombatContext) => boolean;
}

/**
 * Modifier definition
 */
export interface ActionModifier {
  id: string;
  name: string;
  description: string;
  
  // Priority: higher = applied first (negative for early cancellation)
  priority: number;
  
  // Which action types this modifier applies to
  appliesTo: ActionType[];
  
  // Condition for activation
  condition?: ModifierCondition;
  
  // Modifications
  modifyTickCost?: (base: number, context: CombatContext) => number;
  modifyDamage?: (base: number, context: CombatContext) => number;
  modifyHeal?: (base: number, context: CombatContext) => number;
  modifyResourceCost?: (base: number, context: CombatContext) => number;
  modifyRange?: (base: number, context: CombatContext) => number;
  modifyCritChance?: (base: number, context: CombatContext) => number;
  modifyCritDamage?: (base: number, context: CombatContext) => number;
  modifyHitChance?: (base: number, context: CombatContext) => number;
  modifyEvasion?: (base: number, context: CombatContext) => number;
  modifyCooldown?: (base: number, context: CombatContext) => number;
  
  // Can cancel the action entirely
  canCancel?: (context: CombatContext) => boolean;
  cancelReason?: string;
  
  // Can add side effects
  addSideEffects?: (context: CombatContext) => SideEffect[];
}

/**
 * Side effect from modifiers
 */
export interface SideEffect {
  type: 'damage' | 'heal' | 'status' | 'buff' | 'debuff' | 'custom';
  value?: number;
  statusType?: string;
  duration?: number;
  customData?: Record<string, any>;
}

/**
 * Result of modifier application
 */
export interface ModifiedActionValues {
  tickCost?: number;
  damage?: number;
  heal?: number;
  resourceCost?: number;
  range?: number;
  critChance?: number;
  critDamage?: number;
  hitChance?: number;
  evasion?: number;
  cooldown?: number;
}

/**
 * Global combat context - passed to all hooks and modifiers
 */
export interface CombatContext {
  // Combat info
  tick: number;
  turnNumber: number;
  combatStartTick: number;
  
  // Action info
  actionType: ActionType;
  actionId?: string;
  
  // Units
  source?: UnitState;
  target?: UnitState;
  sourceTeam?: UnitState[];
  targetTeam?: UnitState[];
  allUnits?: UnitState[];
  
  // Previous action result
  previousAction?: CombatAction;
  
  // Custom data
  customData?: Record<string, any>;
  
  // Combat state
  combatState?: {
    damageDealt: number;
    damageTaken: number;
    attacksPerformed: number;
    critsLanded: number;
    kills: number;
  };
}

// Re-export type aliases for backwards compatibility
export type IActionModifier = ActionModifier;
