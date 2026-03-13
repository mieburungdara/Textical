/**
 * Flexible Combat System - Plugin Architecture
 * 
 * This module provides:
 * 1. Action Modifier Plugins - Dynamic modification of actions, damage, timing
 * 2. Event Hook System - Intercept and modify combat events
 * 3. Combat Phase System - Structured phases with hook points
 * 4. Conditional Skill Effects - Condition-based skill effects
 * 
 * @deprecated Use ./systems/ for modular imports
 * This file now re-exports from the modular system for backwards compatibility
 */

// Re-export everything from the modular system
export * from './systems/modifiers/index.js';
export * from './systems/hooks/index.js';
export * from './systems/phases/index.js';
export * from './systems/skills/index.js';

// Import classes for the main FlexibleCombatSystem
import { ActionModifierPluginManager } from './systems/modifiers/index.js';
import { CombatEventHookSystem } from './systems/hooks/index.js';
import { CombatPhaseManager } from './systems/phases/index.js';
import { ConditionalSkillEffectSystem } from './systems/skills/index.js';

// Import types from their respective modules
import { CombatAction } from './TickCost.js';
import { 
  ActionType, 
  CombatContext, 
  SideEffect, 
  ActionModifier
} from './systems/modifiers/index.js';
import { EventHook, CombatEventType } from './systems/hooks/index.js';
import { PhaseHookPoint, CombatPhase } from './systems/phases/index.js';

/**
 * Main flexible combat system that integrates all components
 */
export class FlexibleCombatSystem {
  // Core systems
  readonly pluginManager: ActionModifierPluginManager;
  readonly eventHooks: CombatEventHookSystem;
  readonly phaseManager: CombatPhaseManager;
  readonly skillEffects: ConditionalSkillEffectSystem;
  
  constructor() {
    this.pluginManager = new ActionModifierPluginManager();
    this.eventHooks = new CombatEventHookSystem();
    this.phaseManager = new CombatPhaseManager();
    this.skillEffects = new ConditionalSkillEffectSystem();
  }
  
  /**
   * Register a modifier plugin
   */
  registerModifier(modifier: ActionModifier): void {
    this.pluginManager.register(modifier);
  }
  
  /**
   * Register an event hook
   */
  registerEventHook(hook: EventHook): void {
    this.eventHooks.register(hook);
  }
  
  /**
   * Register a phase hook
   */
  registerPhaseHook(hook: PhaseHookPoint): void {
    this.phaseManager.registerHook(hook);
  }
  
  /**
   * Create combat context
   */
  createContext(
    tick: number,
    turnNumber: number,
    source?: any,
    target?: any,
    actionType: ActionType = ActionType.ATTACK
  ): CombatContext {
    return {
      tick,
      turnNumber,
      combatStartTick: 0,
      actionType,
      source,
      target
    };
  }
  
  /**
   * Process an action with all systems
   */
  async processAction(
    context: CombatContext,
    actionFn: () => Promise<CombatAction>
  ): Promise<{
    action: CombatAction;
    modifiedValues?: Record<string, any>;
    sideEffects?: SideEffect[];
    cancelled?: boolean;
  }> {
    // Phase: PRE_ACTION
    const preActionResult = await this.phaseManager.executePhase(
      CombatPhase.PRE_ACTION,
      context,
      async () => {
        // Emit PRE_ACTION event
        const event = this.eventHooks.emitAggregated({
          type: CombatEventType.PRE_ACTION,
          tick: context.tick,
          source: context.source as any,
          target: context.target as any,
          data: { actionType: context.actionType }
        });
        
        if (event.cancelled) {
          return { cancelled: true, reason: event.cancelReason };
        }
        
        // Check modifier cancellation
        const cancelCheck = this.pluginManager.checkCancellation(
          context.actionType,
          context
        );
        if (cancelCheck.cancelled) {
          return { cancelled: true, reason: cancelCheck.reason };
        }
        
        return { cancelled: false };
      }
    );
    
    if (preActionResult.hookResult.skipped) {
      return { 
        action: null as any, 
        cancelled: true,
        modifiedValues: preActionResult.hookResult.modifiedContext as any
      };
    }
    
    // Execute action
    const action = await actionFn();
    
    // Emit POST_ACTION event
    const postEvent = this.eventHooks.emitAggregated({
      type: CombatEventType.POST_ACTION,
      tick: context.tick,
      source: context.source as any,
      target: context.target as any,
      action
    });
    
    // Get side effects
    const sideEffects = this.pluginManager.getSideEffects(context.actionType, context);
    
    // Phase: POST_ACTION
    await this.phaseManager.executePhase(
      CombatPhase.POST_ACTION,
      context,
      async () => action
    );
    
    return {
      action,
      modifiedValues: postEvent.modifiedValues,
      sideEffects
    };
  }
  
  /**
   * Reset all systems
   */
  reset(): void {
    this.eventHooks.clear();
    this.phaseManager.reset();
  }
}

// Export type aliases for backwards compatibility (deprecated)
export type IActionModifier = ActionModifier;
export type IEventHook = EventHook;
export type IPhaseHookPoint = PhaseHookPoint;
