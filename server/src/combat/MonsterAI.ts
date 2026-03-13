/**
 * Monster AI System
 * 
 * Provides intelligent AI behavior for monster units in combat.
 * Includes target selection, skill usage, and tactical decision making.
 * 
 * ============================================================
 * LAST UPDATED: 2026-03-08
 * ============================================================
 */

import { UnitState } from './TickCost.js';
import { getSkillTemplate, SkillCategory, SkillTemplate, SkillTargetType } from '../templates/skills/index.js';

/**
 * Unit role in combat - helps AI decide priorities
 */
export enum UnitRole {
  HEALER = 'healer',       // Has healing skills
  ATTACKER = 'attacker',   // High attack/magic damage
  TANK = 'tank',          // High HP/defense
  SUPPORT = 'support',     // Has buffs/debuffs
  BOSS = 'boss',          // Boss monster with special behavior
}

/**
 * AI Personality - affects decision making
 */
export enum AIPersonality {
  AGGRESSIVE = 'aggressive',     // Focus lowest HP, use skills freely
  DEFENSIVE = 'defensive',      // Prioritize healing, save skills
  BALANCED = 'balanced',        // Mix of both
  BOSS = 'boss',               // Special boss behavior
}

/**
 * AI Decision result
 */
export interface AIDecision {
  targetId: string | null;
  action: 'attack' | 'skill' | 'heal' | 'buff' | 'debuff' | 'wait';
  skillId: string | null;
  reason: string;
}

/**
 * Monster AI Configuration
 */
export interface AIConfig {
  personality: AIPersonality;
  healThreshold: number;      // HP % to use heal (0-1)
  buffThreshold: number;       // HP % to use buff (0-1)
  saveUltimate: boolean;       // Save ultimate skills
  ultimateThreshold: number;   // HP % to use ultimate (0-1)
}

/**
 * Default AI configurations per personality
 */
export const AI_CONFIGS: Record<AIPersonality, AIConfig> = {
  [AIPersonality.AGGRESSIVE]: {
    personality: AIPersonality.AGGRESSIVE,
    healThreshold: 0.2,
    buffThreshold: 0.5,
    saveUltimate: false,
    ultimateThreshold: 0.3,
  },
  [AIPersonality.DEFENSIVE]: {
    personality: AIPersonality.DEFENSIVE,
    healThreshold: 0.5,
    buffThreshold: 0.7,
    saveUltimate: true,
    ultimateThreshold: 0.4,
  },
  [AIPersonality.BALANCED]: {
    personality: AIPersonality.BALANCED,
    healThreshold: 0.35,
    buffThreshold: 0.6,
    saveUltimate: true,
    ultimateThreshold: 0.35,
  },
  [AIPersonality.BOSS]: {
    personality: AIPersonality.BOSS,
    healThreshold: 0.3,
    buffThreshold: 0.5,
    saveUltimate: false,
    ultimateThreshold: 0.25,
  },
};

/**
 * Detect unit role based on skills and stats
 */
export function detectUnitRole(unit: UnitState): UnitRole {
  const skillIds = (unit as any).skillIds || [];
  
  // Check for healing skills
  const hasHealing = skillIds.some((id: string) => {
    const skill = getSkillTemplate(id);
    return skill?.category === SkillCategory.HEALING;
  });
  if (hasHealing) return UnitRole.HEALER;
  
  // Check for buff/debuff skills
  const hasSupport = skillIds.some((id: string) => {
    const skill = getSkillTemplate(id);
    return skill?.category === SkillCategory.BUFF || skill?.category === SkillCategory.DEBUFF;
  });
  if (hasSupport) return UnitRole.SUPPORT;
  
  // Check if it's a boss FIRST (high level, high stats) - before tank
  if (unit.level && unit.level >= 50 && unit.maxHp > 500) {
    return UnitRole.BOSS;
  }
  
  // Check for high magic (likely spellcaster)
  if (unit.magic && unit.magic > unit.attack * 1.5) {
    return UnitRole.ATTACKER;
  }
  
  // Check for high HP/defense (tank)
  if (unit.maxHp > 200 && unit.defense > 15) {
    return UnitRole.TANK;
  }
  
  return UnitRole.ATTACKER;
}

/**
 * Calculate threat level of a unit
 */
export function calculateThreat(unit: UnitState): number {
  let threat = 0;
  
  // Base threat from damage
  const effectiveAttack = unit.attack || 0;
  const effectiveMagic = unit.magic || 0;
  threat += Math.max(effectiveAttack, effectiveMagic);
  
  // Bonus for healing capability
  const role = detectUnitRole(unit);
  if (role === UnitRole.HEALER) threat += 50;
  if (role === UnitRole.BOSS) threat += 100;
  
  // Bonus for buffs
  const hasBuffs = unit.statusEffects?.some(e => 
    e.type === 'BUFF' || e.type === 'SHIELD' || e.type === 'HASTE'
  );
  if (hasBuffs) threat += 20;
  
  return threat;
}

/**
 * Check if unit is low HP
 */
export function isLowHP(unit: UnitState, threshold: number = 0.3): boolean {
  const hpPercent = unit.currentHp / unit.maxHp;
  return hpPercent <= threshold;
}

/**
 * Check if unit is full HP
 */
export function isFullHP(unit: UnitState): boolean {
  return unit.currentHp >= unit.maxHp;
}

/**
 * Select best target for monster AI
 * 
 * Priority:
 * 1. Lowest HP (finish off weakened enemies)
 * 2. Healer (eliminate threat)
 * 3. Highest threat (most dangerous)
 * 4. Random (fallback)
 */
export function selectBestTarget(
  attacker: UnitState,
  targets: UnitState[],
  personality: AIPersonality = AIPersonality.BALANCED
): UnitState | null {
  if (targets.length === 0) return null;
  if (targets.length === 1) return targets[0];
  
  const config = AI_CONFIGS[personality];
  const validTargets = targets.filter(t => t.isAlive && t.currentHp > 0);
  
  if (validTargets.length === 0) return null;
  
  // For aggressive: prioritize lowest HP
  if (personality === AIPersonality.AGGRESSIVE) {
    return validTargets.reduce((lowest, t) => 
      t.currentHp < lowest.currentHp ? t : lowest
    );
  }
  
  // For defensive: prioritize highest threat
  if (personality === AIPersonality.DEFENSIVE) {
    return validTargets.reduce((highest, t) => 
      calculateThreat(t) > calculateThreat(highest) ? t : highest
    );
  }
  
  // For balanced: consider both HP and threat
  if (personality === AIPersonality.BALANCED || personality === AIPersonality.BOSS) {
    // Score each target
    const scoredTargets = validTargets.map(t => {
      const hpScore = (t.currentHp / t.maxHp) * 100; // Lower HP = higher score
      const threatScore = calculateThreat(t);
      const finalScore = hpScore + (threatScore * 0.5);
      return { target: t, score: finalScore };
    });
    
    // Return target with lowest score (most vulnerable but threatening)
    scoredTargets.sort((a, b) => a.score - b.score);
    return scoredTargets[0].target;
  }
  
  // Fallback: random
  return validTargets[Math.floor(Math.random() * validTargets.length)];
}

/**
 * Select best skill to use for monster AI
 */
export function selectBestSkill(
  unit: UnitState,
  target: UnitState,
  allies: UnitState[],
  tick: number,
  personality: AIPersonality = AIPersonality.BALANCED
): string | null {
  const skillIds = (unit as any).skillIds || [];
  const config = AI_CONFIGS[personality];
  const hpPercent = unit.currentHp / unit.maxHp;
  
  // Filter available skills
  const availableSkills: { id: string; skill: SkillTemplate; score: number }[] = [];
  
  for (const skillId of skillIds) {
    const skill = getSkillTemplate(skillId);
    if (!skill) continue;
    
    // Check mana
    if ((unit.mana || 0) < skill.manaCost) continue;
    
    // Check cooldown
    const cooldownKey = `cooldown_${skillId}`;
    const lastUsed = (unit as any)[cooldownKey] || 0;
    if (tick - lastUsed < (skill.cooldown || 10)) continue;
    
    // Check if ultimate and config says save
    if (config.saveUltimate && skill.tier && skill.tier >= 4) {
      // Only use ultimate if HP is below threshold
      if (hpPercent > config.ultimateThreshold) continue;
    }
    
    // Calculate skill score based on situation
    let score = 0;
    const reason = evaluateSkill(skill, unit, target, allies, hpPercent, config);
    score = reason.score;
    
    if (score > 0) {
      availableSkills.push({ id: skillId, skill, score });
    }
  }
  
  if (availableSkills.length === 0) return null;
  
  // Sort by score and return best
  availableSkills.sort((a, b) => b.score - a.score);
  return availableSkills[0].id;
}

/**
 * Evaluate a skill and return score and reason
 */
function evaluateSkill(
  skill: SkillTemplate,
  unit: UnitState,
  target: UnitState,
  allies: UnitState[],
  hpPercent: number,
  config: AIConfig
): { score: number; reason: string } {
  
  // Healing skills - high priority when low HP
  if (skill.category === SkillCategory.HEALING) {
    if (hpPercent <= config.healThreshold) {
      // Need healing badly
      if (skill.id === 'greater_heal' || skill.id === 'group_heal') {
        return { score: 100, reason: 'Critical HP - using heal' };
      }
      return { score: 80, reason: 'Low HP - using heal' };
    }
    // Can heal allies
    if (skill.targetType === SkillTargetType.ALLY) {
      const lowHpAlly = allies.find(a => a.id !== unit.id && (a.currentHp / a.maxHp) <= config.healThreshold);
      if (lowHpAlly) {
        return { score: 70, reason: 'Ally low HP - healing' };
      }
    }
    return { score: 10, reason: 'HP fine - minor heal' };
  }
  
  // Buff skills - use when healthy
  if (skill.category === SkillCategory.BUFF) {
    if (hpPercent >= config.buffThreshold) {
      if (skill.targetType === SkillTargetType.SELF) {
        return { score: 60, reason: 'Healthy - self buff' };
      }
      // Buff lowest HP ally
      const lowestAlly = allies
        .filter(a => a.id !== unit.id)
        .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];
      if (lowestAlly && (lowestAlly.currentHp / lowestAlly.maxHp) < 0.5) {
        return { score: 65, reason: 'Buffing vulnerable ally' };
      }
    }
    return { score: 0, reason: 'Not ideal for buff' };
  }
  
  // Debuff skills - use on dangerous targets
  if (skill.category === SkillCategory.DEBUFF) {
    const targetThreat = calculateThreat(target);
    if (targetThreat > 30) {
      // High threat target - good to debuff
      return { score: 50, reason: 'Debuffing dangerous target' };
    }
    return { score: 20, reason: 'Minor debuff' };
  }
  
  // Damage skills - always good
  if (skill.category === SkillCategory.MAGIC || skill.category === SkillCategory.PHYSICAL) {
    const baseScore = 30;
    
    // Bonus for low HP target (can finish)
    if (target.currentHp / target.maxHp < 0.3) {
      return { score: baseScore + 40, reason: 'Finishing low HP target' };
    }
    
    // Bonus for AOE when multiple targets
    if (skill.areaOfEffect && skill.areaOfEffect > 1) {
      return { score: baseScore + 20, reason: 'AOE damage' };
    }
    
    return { score: baseScore, reason: 'Regular damage' };
  }
  
  return { score: 0, reason: 'No good use' };
}

/**
 * Make AI decision for a monster unit
 */
export function makeAIDecision(
  unit: UnitState,
  enemies: UnitState[],
  allies: UnitState[],
  tick: number,
  personality?: AIPersonality
): AIDecision {
  // Determine personality
  const role = detectUnitRole(unit);
  const actualPersonality = personality || (
    role === UnitRole.BOSS ? AIPersonality.BOSS : 
    role === UnitRole.HEALER ? AIPersonality.DEFENSIVE :
    AIPersonality.BALANCED
  );
  
  const config = AI_CONFIGS[actualPersonality];
  const hpPercent = unit.currentHp / unit.maxHp;
  
  // Check if should heal
  if (hpPercent <= config.healThreshold) {
    const healSkillId = selectBestSkill(unit, unit, allies, tick, actualPersonality);
    if (healSkillId) {
      const skill = getSkillTemplate(healSkillId);
      return {
        targetId: skill?.targetType === SkillTargetType.SELF ? unit.id : allies.find(a => a.id !== unit.id)?.id || unit.id,
        action: 'heal',
        skillId: healSkillId,
        reason: 'Low HP - using heal skill',
      };
    }
  }
  
  // Check if should buff
  if (hpPercent >= config.buffThreshold) {
    const buffSkillId = selectBestSkill(unit, unit, allies, tick, actualPersonality);
    if (buffSkillId) {
      const skill = getSkillTemplate(buffSkillId);
      return {
        targetId: skill?.targetType === SkillTargetType.SELF ? unit.id : allies[0]?.id || unit.id,
        action: 'buff',
        skillId: buffSkillId,
        reason: 'Healthy - using buff skill',
      };
    }
  }
  
  // Select target
  const target = selectBestTarget(unit, enemies, actualPersonality);
  if (!target) {
    return {
      targetId: null,
      action: 'wait',
      skillId: null,
      reason: 'No valid targets',
    };
  }
  
  // Check if should use skill on target
  const skillId = selectBestSkill(unit, target, allies, tick, actualPersonality);
  if (skillId) {
    const skill = getSkillTemplate(skillId);
    const action = skill?.category === SkillCategory.DEBUFF ? 'debuff' : 'skill';
    return {
      targetId: target.id,
      action,
      skillId,
      reason: `Using ${skillId} on ${target.name}`,
    };
  }
  
  // Default to attack
  return {
    targetId: target.id,
    action: 'attack',
    skillId: null,
    reason: `Attacking ${target.name}`,
  };
}

/**
 * Check if unit should act (AI controlled)
 */
export function isAIUnit(unit: UnitState): boolean {
  // Units with 'enemy' in ID are AI controlled
  return unit.id.toLowerCase().includes('enemy') || 
         unit.id.toLowerCase().includes('monster') ||
         unit.id.toLowerCase().includes('npc');
}
