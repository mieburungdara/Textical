/**
 * Phase Types - Combat Phase System
 * 
 * Part of Flexible Combat System
 * Contains all types and interfaces for the combat phase system
 */

import { CombatAction } from '../../TickCost.js';
import { ActionType, CombatContext } from '../modifiers/types.js';

/**
 * Combat phases
 */
export enum CombatPhase {
  INIT = 'init',               // Initialization
  PRE_INITIATIVE = 'pre_initiative', // Before turn order
  INITIATIVE = 'initiative',  // Determine turn order
  PRE_ACTION = 'pre_action',   // Before each action
  ACTION = 'action',          // Execute action
  POST_ACTION = 'post_action', // After action
  REACTION = 'reaction',       // Reaction abilities
  STATUS_TICK = 'status_tick', // Process status effects
  PRE_END = 'pre_end',        // Before turn end
  END = 'end',                // End of turn
  COMBAT_END = 'combat_end'   // Combat finished
}

/**
 * Phase hook point
 */
export interface PhaseHookPoint {
  phase: CombatPhase;
  beforeHook?: (context: CombatContext) => PhaseHookResult;
  afterHook?: (context: CombatContext, result: any) => PhaseHookResult;
}

/**
 * Result of phase hook
 */
export interface PhaseHookResult {
  // Can skip this phase
  skipped?: boolean;
  skipReason?: string;
  
  // Can modify context
  modifiedContext?: Partial<CombatContext>;
  
  // Can add additional actions
  additionalActions?: CombatAction[];
  
  // Can modify result
  modifiedResult?: any;
}

// Re-export type aliases for backwards compatibility
export type IPhaseHookPoint = PhaseHookPoint;
