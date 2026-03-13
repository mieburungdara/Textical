/**
 * Hook Types - Combat Event Hook System
 * 
 * Part of Flexible Combat System
 * Contains all types and interfaces for the event hook system
 */

import { UnitState, CombatAction } from '../../TickCost.js';

/**
 * Combat events that can be hooked
 */
export enum CombatEventType {
  // Action events
  PRE_ACTION = 'pre_action',
  POST_ACTION = 'post_action',
  ACTION_CANCELLED = 'action_cancelled',
  
  // Damage events
  PRE_DAMAGE = 'pre_damage',
  POST_DAMAGE = 'post_damage',
  PRE_HEAL = 'pre_heal',
  POST_HEAL = 'post_heal',
  
  // Hit events
  ON_HIT = 'on_hit',
  ON_MISS = 'on_miss',
  ON_DODGE = 'on_dodge',
  ON_CRIT = 'on_crit',
  ON_KILL = 'on_kill',
  ON_DEATH = 'on_death',
  
  // Turn events
  TURN_START = 'turn_start',
  TURN_END = 'turn_end',
  
  // Status events
  STATUS_APPLIED = 'status_applied',
  STATUS_REMOVED = 'status_removed',
  STATUS_TICK = 'status_tick',
  
  // Combat events
  COMBAT_START = 'combat_start',
  COMBAT_END = 'combat_end',
  PHASE_CHANGE = 'phase_change',
  
  // Custom events
  CUSTOM = 'custom'
}

/**
 * Event hook callback type
 */
export type EventHookCallback = (event: CombatEvent) => EventHookResult;

/**
 * Result of event hook processing
 */
export interface EventHookResult {
  // Can cancel the event
  cancelled?: boolean;
  cancelReason?: string;
  
  // Can modify the event data
  modifiedValues?: Record<string, any>;
  
  // Can add additional effects
  additionalEffects?: CombatEvent[];
  
  // Can add logs
  additionalLogs?: string[];
}

/**
 * Combat event data
 */
export interface CombatEvent {
  type: CombatEventType;
  tick: number;
  source?: UnitState;
  target?: UnitState;
  action?: CombatAction;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Event hook definition
 */
export interface EventHook {
  id: string;
  name: string;
  description?: string;
  
  // Events to listen to
  events: CombatEventType[];
  
  // Priority: higher = executed first
  priority: number;
  
  // Filter: only trigger for specific conditions
  filter?: (event: CombatEvent) => boolean;
  
  // The callback
  callback: EventHookCallback;
  
  // Once: only trigger once then auto-remove
  once?: boolean;
}

// Re-export type aliases for backwards compatibility
export type IEventHook = EventHook;
