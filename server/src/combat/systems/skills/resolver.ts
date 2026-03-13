/**
 * Skills Resolver - Conditional Skill Effects System
 * 
 * Part of Flexible Combat System
 * Evaluates and resolves conditional skill effects
 */

import { UnitState } from '../../TickCost.js';
import { ActionType, CombatContext, ActionModifierPluginManager } from '../modifiers/index.js';
import { 
  ConditionType, 
  SkillCondition, 
  SkillEffectBranch, 
  SkillEffect, 
  SkillEffectType,
  ResolvedEffect 
} from './types.js';

/**
 * Conditional skill effect evaluator
 */
export class ConditionalSkillEffectSystem {
  /**
   * Evaluate a condition
   */
  evaluateCondition(condition: SkillCondition, context: CombatContext): boolean {
    switch (condition.type) {
      case ConditionType.HP_PERCENT:
      case ConditionType.TARGET_HP_PERCENT: {
        const target = context.target;
        if (!target) return false;
        const hpPercent = (target.currentHp / target.maxHp) * 100;
        return this.compareNumeric(hpPercent, condition.value, condition.value2);
      }
      
      case ConditionType.ATTACKER_HP_PERCENT: {
        const source = context.source;
        if (!source) return false;
        const hpPercent = (source.currentHp / source.maxHp) * 100;
        return this.compareNumeric(hpPercent, condition.value, condition.value2);
      }
      
      case ConditionType.TARGET_ALIVE:
        return context.target?.isAlive ?? false;
        
      case ConditionType.TARGET_DEAD:
        return !context.target?.isAlive;
        
      case ConditionType.HAS_STATUS: {
        if (!condition.statusType || !context.target) return false;
        return context.target.statusEffects?.some(
          (e: any) => e.type === condition.statusType
        ) ?? false;
      }
      
      case ConditionType.LACKS_STATUS: {
        if (!condition.statusType || !context.target) return true;
        return !context.target.statusEffects?.some(
          (e: any) => e.type === condition.statusType
        );
      }
      
      case ConditionType.TURN_NUMBER: {
        return this.compareNumeric(context.turnNumber, condition.value, condition.value2);
      }
      
      case ConditionType.TICK_NUMBER: {
        return this.compareNumeric(context.tick, condition.value, condition.value2);
      }
      
      case ConditionType.COMBAT_DURATION: {
        const duration = context.tick - (context.combatStartTick || 0);
        return this.compareNumeric(duration, condition.value, condition.value2);
      }
      
      case ConditionType.DISTANCE: {
        if (!context.source?.position || !context.target?.position) return false;
        const dist = Math.abs(context.target.position.x - context.source.position.x) +
                    Math.abs(context.target.position.y - context.source.position.y);
        return this.compareNumeric(dist, condition.value, condition.value2);
      }
      
      case ConditionType.HP_ABOVE_50:
      case ConditionType.HP_BELOW_50: {
        const target = context.target;
        if (!target) return false;
        const hpPercent = (target.currentHp / target.maxHp) * 100;
        if (condition.type === ConditionType.HP_ABOVE_50) {
          return hpPercent > 50;
        } else {
          return hpPercent < 50;
        }
      }
      
      case ConditionType.ATTACK_COUNT: {
        const combatState = context.combatState;
        if (!combatState) return false;
        return this.compareNumeric(combatState.attacksPerformed, condition.value, condition.value2);
      }
      
      case ConditionType.HIT_COUNT: {
        const combatState = context.combatState;
        if (!combatState) return false;
        // Hit count would need tracking separately
        return this.compareNumeric(combatState.damageDealt > 0 ? combatState.attacksPerformed : 0, condition.value, condition.value2);
      }
      
      case ConditionType.MISS_COUNT: {
        // Miss count would need separate tracking
        return this.compareNumeric(0, condition.value, condition.value2);
      }
      
      case ConditionType.KILL_COUNT: {
        const combatState = context.combatState;
        if (!combatState) return false;
        return this.compareNumeric(combatState.kills, condition.value, condition.value2);
      }
      
      case ConditionType.CRIT_RECENTLY: {
        const combatState = context.combatState;
        if (!combatState) return false;
        const ticksSinceLastCrit = context.tick - (combatState.critsLanded > 0 ? context.tick : 999);
        return this.compareNumeric(ticksSinceLastCrit, condition.value, condition.value2);
      }
      
      case ConditionType.IS_FIRST_ACTION: {
        return context.tick <= 10 || context.turnNumber <= 1;
      }
      
      case ConditionType.IS_COUPLED: {
        // Check if units are adjacent (distance = 1)
        if (!context.source?.position || !context.target?.position) return false;
        const dist = Math.abs(context.target.position.x - context.source.position.x) +
                    Math.abs(context.target.position.y - context.source.position.y);
        return dist <= 1;
      }
      
      case ConditionType.MANA_ABOVE_30: {
        // Check if source has mana above 30%
        if (!context.source) return false;
        const sourceMana = (context.source as any).mana ?? (context.source as any).mp ?? 0;
        const sourceMaxMana = (context.source as any).maxMana ?? (context.source as any).maxMp ?? 100;
        if (sourceMaxMana <= 0) return false;
        return (sourceMana / sourceMaxMana) > 0.3;
      }
      
      case ConditionType.MANA_BELOW_30: {
        // Check if source has mana below 30%
        if (!context.source) return false;
        const sourceMana = (context.source as any).mana ?? (context.source as any).mp ?? 0;
        const sourceMaxMana = (context.source as any).maxMana ?? (context.source as any).maxMp ?? 100;
        if (sourceMaxMana <= 0) return false;
        return (sourceMana / sourceMaxMana) < 0.3;
      }
      
      case ConditionType.RANDOM_CHANCE: {
        const chance = condition.value || 50;
        return Math.random() * 100 < chance;
      }
      
      case ConditionType.CUSTOM: {
        return condition.customFn ? condition.customFn(context) : false;
      }
      
      default:
        return false;
    }
  }
  
  /**
   * Compare numeric values
   */
  private compareNumeric(actual: number, target?: number, target2?: number): boolean {
    if (target === undefined) return true;
    if (target2 === undefined) {
      // Single value comparison
      return actual === target;
    }
    // Range comparison
    return actual >= target && actual <= target2;
  }
  
  /**
   * Evaluate all branches and collect effects
   */
  evaluateBranches(
    branches: SkillEffectBranch[],
    context: CombatContext
  ): SkillEffect[] {
    const effects: SkillEffect[] = [];
    
    for (const branch of branches) {
      if (this.evaluateCondition(branch.condition, context)) {
        effects.push(...branch.effects);
      }
    }
    
    return effects;
  }
  
  /**
   * Resolve all effects (including nested branches and chains)
   */
  resolveEffects(
    effects: SkillEffect[],
    context: CombatContext,
    modifierManager: ActionModifierPluginManager
  ): ResolvedEffect[] {
    const resolved: ResolvedEffect[] = [];
    
    for (const effect of effects) {
      // First evaluate any branches
      let finalEffects = effect.branches 
        ? this.evaluateBranches(effect.branches, context)
        : [effect];
      
      // Add the main effect itself
      if (!effect.branches) {
        finalEffects = [effect];
      } else if (finalEffects.length === 0) {
        // Use default effects if no branch matched
        finalEffects = [effect];
      }
      
      for (const fe of finalEffects) {
        const resolvedEffect = this.resolveSingleEffect(fe, context, modifierManager);
        resolved.push(resolvedEffect);
        
        // Resolve chain effects recursively
        if (fe.chainEffects && fe.chainEffects.length > 0) {
          const chainResolved = this.resolveEffects(fe.chainEffects, context, modifierManager);
          resolved.push(...chainResolved);
        }
      }
    }
    
    return resolved;
  }
  
  /**
   * Resolve a single effect with modifiers
   */
  private resolveSingleEffect(
    effect: SkillEffect,
    context: CombatContext,
    modifierManager: ActionModifierPluginManager
  ): ResolvedEffect {
    let value = effect.value || 0;
    
    // Calculate percentage-based values
    if (effect.percentOf && context.source) {
      switch (effect.percentOf) {
        case 'attack':
          value = (context.source.attack || 0) * (effect.percentMultiplier || 1);
          break;
        case 'max_hp':
          value = (context.source.maxHp || 0) * (effect.percentMultiplier || 1);
          break;
        case 'current_hp':
          value = (context.source.currentHp || 0) * (effect.percentMultiplier || 1);
          break;
        case 'missing_hp':
          value = ((context.source.maxHp || 0) - (context.source.currentHp || 0)) * (effect.percentMultiplier || 1);
          break;
        case 'int':
          value = ((context.source as any).intelligence || 0) * (effect.percentMultiplier || 1);
          break;
      }
    }
    
    // Apply modifiers
    if (effect.type === SkillEffectType.DAMAGE) {
      const modified = modifierManager.applyModifiers(
        ActionType.SKILL,
        { damage: value },
        context
      );
      value = modified.damage || value;
    } else if (effect.type === SkillEffectType.HEAL) {
      const modified = modifierManager.applyModifiers(
        ActionType.SKILL,
        { heal: value },
        context
      );
      value = modified.heal || value;
    }
    
    return {
      ...effect,
      resolvedValue: Math.floor(value),
      resolvedTargets: this.resolveTargets(effect, context)
    };
  }
  
  /**
   * Resolve targets for effect
   */
  private resolveTargets(effect: SkillEffect, context: CombatContext): UnitState[] {
    const targets: UnitState[] = [];
    
    switch (effect.targetType) {
      case 'self':
        if (context.source) targets.push(context.source);
        break;
      case 'target':
        if (context.target) targets.push(context.target);
        break;
      case 'ally':
      case 'enemy':
      case 'aoe':
        // Would need access to all units - simplified for now
        if (context.target) targets.push(context.target);
        break;
    }
    
    return targets;
  }
}
