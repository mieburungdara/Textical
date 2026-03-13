/**
 * Hook Manager - Combat Event Hook System
 * 
 * Part of Flexible Combat System
 * Manages registration and execution of event hooks
 */

import logger from '../../../utils/logger.js';
import { 
  EventHook, 
  EventHookResult, 
  CombatEvent 
} from './types.js';

/**
 * Event hook system
 */
export class CombatEventHookSystem {
  private hooks: EventHook[] = [];
  private onceHooks: Set<string> = new Set();
  
  /**
   * Register a new event hook
   */
  register(hook: EventHook): void {
    this.hooks.push(hook);
    this.hooks.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Unregister a hook
   */
  unregister(hookId: string): boolean {
    const index = this.hooks.findIndex(h => h.id === hookId);
    if (index >= 0) {
      this.hooks.splice(index, 1);
      this.onceHooks.delete(hookId);
      return true;
    }
    return false;
  }
  
  /**
   * Emit an event and get all hook results
   */
  emit(event: CombatEvent): EventHookResult[] {
    const results: EventHookResult[] = [];
    const hooksToProcess = this.hooks.filter(
      h => h.events.includes(event.type) && 
           (!h.filter || h.filter(event)) &&
           !this.onceHooks.has(h.id)
    );
    
    for (const hook of hooksToProcess) {
      try {
        const result = hook.callback(event);
        results.push(result);
        
        // Remove if once hook
        if (hook.once) {
          this.onceHooks.add(hook.id);
        }
      } catch (error) {
        logger.error(`[EventHook] Error in hook ${hook.id}:`, { 
          error: error instanceof Error ? error.message : String(error), 
          stack: error instanceof Error ? error.stack : undefined 
        });
      }
    }
    
    return results;
  }
  
  /**
   * Emit and aggregate results (combine modifications)
   */
  emitAggregated(event: CombatEvent): EventHookResult {
    const results = this.emit(event);
    
    // Combine all modifications
    let cancelled = false;
    let cancelReason = '';
    const allModifiedValues: Record<string, any> = {};
    const allAdditionalEffects: CombatEvent[] = [];
    const allAdditionalLogs: string[] = [];
    
    for (const result of results) {
      if (result.cancelled) {
        cancelled = true;
        cancelReason = result.cancelReason || cancelReason;
      }
      
      if (result.modifiedValues) {
        Object.assign(allModifiedValues, result.modifiedValues);
      }
      
      if (result.additionalEffects) {
        allAdditionalEffects.push(...result.additionalEffects);
      }
      
      if (result.additionalLogs) {
        allAdditionalLogs.push(...result.additionalLogs);
      }
    }
    
    return {
      cancelled,
      cancelReason: cancelled ? cancelReason : undefined,
      modifiedValues: Object.keys(allModifiedValues).length > 0 ? allModifiedValues : undefined,
      additionalEffects: allAdditionalEffects.length > 0 ? allAdditionalEffects : undefined,
      additionalLogs: allAdditionalLogs.length > 0 ? allAdditionalLogs : undefined
    };
  }
  
  /**
   * Clear all hooks
   */
  clear(): void {
    this.hooks = [];
    this.onceHooks.clear();
  }
  
  /**
   * Clear only once hooks
   */
  clearOnceHooks(): void {
    this.onceHooks.clear();
  }
}
