/**
 * Phase Manager - Combat Phase System
 * 
 * Part of Flexible Combat System
 * Manages phase transitions and phase hooks
 */

import { 
  CombatPhase, 
  PhaseHookPoint, 
  PhaseHookResult 
} from './types.js';
import { CombatContext } from '../modifiers/types.js';

/**
 * Combat phase manager
 */
export class CombatPhaseManager {
  private phaseHooks: Map<CombatPhase, PhaseHookPoint[]> = new Map();
  private currentPhase: CombatPhase = CombatPhase.INIT;
  private phaseHistory: { phase: CombatPhase; tick: number; duration: number }[] = [];
  private lastPhaseTick: number = 0;
  
  /**
   * Register a phase hook
   */
  registerHook(hook: PhaseHookPoint): void {
    const hooks = this.phaseHooks.get(hook.phase) || [];
    hooks.push(hook);
    this.phaseHooks.set(hook.phase, hooks);
  }
  
  /**
   * Unregister phase hook
   */
  unregisterHook(phase: CombatPhase, hook: PhaseHookPoint): void {
    const hooks = this.phaseHooks.get(phase);
    if (hooks) {
      const index = hooks.indexOf(hook);
      if (index >= 0) {
        hooks.splice(index, 1);
      }
    }
  }
  
  /**
   * Get current phase
   */
  getCurrentPhase(): CombatPhase {
    return this.currentPhase;
  }
  
  /**
   * Set current phase (internal use)
   */
  _setPhase(phase: CombatPhase, tick: number): void {
    // Record previous phase duration
    if (this.currentPhase !== CombatPhase.INIT) {
      this.phaseHistory.push({
        phase: this.currentPhase,
        tick: this.lastPhaseTick,
        duration: tick - this.lastPhaseTick
      });
    }
    
    this.currentPhase = phase;
    this.lastPhaseTick = tick;
  }
  
  /**
   * Execute a phase with hooks
   */
  async executePhase(
    phase: CombatPhase,
    context: CombatContext,
    executeFn: () => Promise<any>
  ): Promise<{ result: any; hookResult: PhaseHookResult }> {
    this._setPhase(phase, context.tick);
    
    // Get hooks for this phase
    const hooks = this.phaseHooks.get(phase) || [];
    
    // Execute before hooks
    let hookResult: PhaseHookResult = {};
    for (const hook of hooks) {
      if (hook.beforeHook) {
        const beforeResult = hook.beforeHook(context);
        if (beforeResult.skipped) {
          return { 
            result: beforeResult.modifiedResult, 
            hookResult: beforeResult 
          };
        }
        // Merge results
        Object.assign(hookResult, beforeResult);
      }
    }
    
    // Apply modified context
    const finalContext = hookResult.modifiedContext 
      ? { ...context, ...hookResult.modifiedContext }
      : context;
    
    // Execute the phase function
    let result = await executeFn();
    
    // Apply modified result
    if (hookResult.modifiedResult) {
      result = hookResult.modifiedResult;
    }
    
    // Execute after hooks
    for (const hook of hooks) {
      if (hook.afterHook) {
        const afterResult = hook.afterHook(finalContext, result);
        Object.assign(hookResult, afterResult);
      }
    }
    
    return { result, hookResult };
  }
  
  /**
   * Get phase history
   */
  getPhaseHistory(): { phase: CombatPhase; tick: number; duration: number }[] {
    return [...this.phaseHistory];
  }
  
  /**
   * Reset phase manager
   */
  reset(): void {
    this.currentPhase = CombatPhase.INIT;
    this.phaseHistory = [];
    this.lastPhaseTick = 0;
  }
}
