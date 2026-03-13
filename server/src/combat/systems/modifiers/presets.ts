/**
 * Modifier Presets - Example Action Modifiers
 * 
 * Part of Flexible Combat System
 * Contains preset modifier factories for common combat mechanics
 */

import { ActionModifier, ActionType } from './types.js';

/**
 * Example: Critical Strike Modifier
 * Increases critical damage by 50% when target HP < 30%
 */
export function createCriticalStrikeModifier(): ActionModifier {
  return {
    id: 'critical_strike_mod',
    name: 'Critical Strike',
    description: 'Increases critical damage by 50% when target HP < 30%',
    priority: 10,
    appliesTo: [ActionType.ATTACK, ActionType.SKILL],
    condition: {
      targetUnit: (target) => {
        const hpPercent = (target.currentHp / target.maxHp) * 100;
        return hpPercent < 30;
      }
    },
    modifyCritDamage: (base) => base * 1.5
  };
}

/**
 * Example: Low HP Berserk Modifier
 * Deal 50% more damage when HP < 25%
 */
export function createBerserkModifier(): ActionModifier {
  return {
    id: 'berserk_mod',
    name: 'Berserk',
    description: 'Deal 50% more damage when HP < 25%',
    priority: 20,
    appliesTo: [ActionType.ATTACK, ActionType.SKILL],
    condition: {
      sourceUnit: (source) => {
        const hpPercent = (source.currentHp / source.maxHp) * 100;
        return hpPercent < 25;
      }
    },
    modifyDamage: (base) => Math.floor(base * 1.5)
  };
}

/**
 * Example: First Hit Bonus Modifier
 * Deal 25% more damage on first attack of combat
 */
export function createFirstHitModifier(): ActionModifier {
  return {
    id: 'first_hit_mod',
    name: 'First Strike',
    description: 'Deal 25% more damage on first attack of combat',
    priority: 30,
    appliesTo: [ActionType.ATTACK],
    condition: {
      combatContext: (ctx) => ctx.tick <= 10
    },
    modifyDamage: (base) => Math.floor(base * 1.25)
  };
}
