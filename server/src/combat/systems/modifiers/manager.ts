/**
 * Modifier Manager - Action Modifier Plugin System
 * 
 * Part of Flexible Combat System
 * Manages registration and application of action modifiers
 */

import logger from '../../../utils/logger.js';
import { 
  ActionModifier, 
  ModifiedActionValues, 
  CombatContext, 
  SideEffect, 
  ActionType 
} from './types.js';

/**
 * Plugin manager for action modifiers
 */
export class ActionModifierPluginManager {
  private modifiers: ActionModifier[] = [];
  private enabled: Set<string> = new Set();
  
  /**
   * Register a new modifier plugin
   */
  register(modifier: ActionModifier): void {
    this.modifiers.push(modifier);
    this.modifiers.sort((a, b) => b.priority - a.priority); // Sort by priority
    this.enabled.add(modifier.id);
  }
  
  /**
   * Unregister a modifier
   */
  unregister(modifierId: string): boolean {
    const index = this.modifiers.findIndex(m => m.id === modifierId);
    if (index >= 0) {
      this.modifiers.splice(index, 1);
      this.enabled.delete(modifierId);
      return true;
    }
    return false;
  }
  
  /**
   * Enable/disable a modifier
   */
  setEnabled(modifierId: string, enabled: boolean): void {
    if (enabled) {
      this.enabled.add(modifierId);
    } else {
      this.enabled.delete(modifierId);
    }
  }
  
  /**
   * Check if modifier is enabled
   */
  isEnabled(modifierId: string): boolean {
    return this.enabled.has(modifierId);
  }
  
  /**
   * Get all enabled modifiers for an action type
   */
  getModifiersForAction(actionType: ActionType): ActionModifier[] {
    return this.modifiers.filter(
      m => this.enabled.has(m.id) && m.appliesTo.includes(actionType)
    );
  }
  
  /**
   * Apply all modifiers to calculate final values
   */
  applyModifiers(
    actionType: ActionType,
    baseValues: {
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
    },
    context: CombatContext
  ): ModifiedActionValues {
    const modifiers = this.getModifiersForAction(actionType);
    const result = { ...baseValues };
    
    for (const mod of modifiers) {
      // Check conditions
      if (mod.condition) {
        if (mod.condition.sourceUnit && context.source && !mod.condition.sourceUnit(context.source)) continue;
        if (mod.condition.targetUnit && context.target && !mod.condition.targetUnit(context.target)) continue;
        if (mod.condition.combatContext && !mod.condition.combatContext(context)) continue;
      }
      
      // Apply modifiers
      if (result.tickCost !== undefined && mod.modifyTickCost) {
        result.tickCost = mod.modifyTickCost(result.tickCost, context);
      }
      if (result.damage !== undefined && mod.modifyDamage) {
        result.damage = mod.modifyDamage(result.damage, context);
      }
      if (result.heal !== undefined && mod.modifyHeal) {
        result.heal = mod.modifyHeal(result.heal, context);
      }
      if (result.resourceCost !== undefined && mod.modifyResourceCost) {
        result.resourceCost = mod.modifyResourceCost(result.resourceCost, context);
      }
      if (result.range !== undefined && mod.modifyRange) {
        result.range = mod.modifyRange(result.range, context);
      }
      if (result.critChance !== undefined && mod.modifyCritChance) {
        result.critChance = mod.modifyCritChance(result.critChance, context);
      }
      if (result.critDamage !== undefined && mod.modifyCritDamage) {
        result.critDamage = mod.modifyCritDamage(result.critDamage, context);
      }
      if (result.hitChance !== undefined && mod.modifyHitChance) {
        result.hitChance = mod.modifyHitChance(result.hitChance, context);
      }
      if (result.evasion !== undefined && mod.modifyEvasion) {
        result.evasion = mod.modifyEvasion(result.evasion, context);
      }
      if (result.cooldown !== undefined && mod.modifyCooldown) {
        result.cooldown = mod.modifyCooldown(result.cooldown, context);
      }
    }
    
    return result;
  }
  
  /**
   * Check if any modifier cancels the action
   */
  checkCancellation(actionType: ActionType, context: CombatContext): { cancelled: boolean; reason?: string } {
    const modifiers = this.getModifiersForAction(actionType);
    
    for (const mod of modifiers) {
      if (mod.canCancel && mod.canCancel(context)) {
        return { cancelled: true, reason: mod.cancelReason || 'Cancelled by modifier' };
      }
    }
    
    return { cancelled: false };
  }
  
  /**
   * Get all side effects from modifiers
   */
  getSideEffects(actionType: ActionType, context: CombatContext): SideEffect[] {
    const modifiers = this.getModifiersForAction(actionType);
    const sideEffects: SideEffect[] = [];
    
    for (const mod of modifiers) {
      if (mod.addSideEffects) {
        const effects = mod.addSideEffects(context);
        sideEffects.push(...effects);
      }
    }
    
    return sideEffects;
  }
}
