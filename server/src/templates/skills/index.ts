/**
 * Skill Templates Index
 * 
 * Central export for all skill templates.
 * Provides helper functions to get and manage skills.
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType, calculateActualCastTime, canCastSkill, BASE_CAST_SPEED } from './SkillTemplate.js';

// Re-export types and functions
export { 
  SkillTemplate, 
  SkillCategory, 
  SkillTargetType, 
  SkillTier, 
  SkillEffectType,
  calculateActualCastTime,
  canCastSkill,
  BASE_CAST_SPEED,
  SKILL_CAST_LIMITS
} from './SkillTemplate.js';

// ========== SKILL REGISTRY ==========

/**
 * All skill templates indexed by skill ID
 */
export const SKILL_TEMPLATES: Record<string, SkillTemplate> = {
  // ========== PHYSICAL SKILLS ==========
  
  'slash': {
    id: 'slash',
    name: 'Slash',
    description: 'A powerful sword slash that deals damage',
    category: SkillCategory.PHYSICAL,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.ENEMY,
    castTime: 12,
    manaCost: 5,
    damageMultiplier: 1.2,
    range: 1,
    canCrit: true,
    canDodge: true,
    icon: '⚔️',
  },
  
  'thrust': {
    id: 'thrust',
    name: 'Thrust',
    description: 'A precise thrust attack',
    category: SkillCategory.PHYSICAL,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.ENEMY,
    castTime: 10,
    manaCost: 3,
    damageMultiplier: 1.1,
    range: 1,
    canCrit: true,
    canDodge: true,
    icon: '🗡️',
  },
  
  'spin': {
    id: 'spin',
    name: 'Spin Attack',
    description: 'Area attack that hits all surrounding enemies',
    category: SkillCategory.PHYSICAL,
    tier: SkillTier.ADVANCED,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.AREA,
    castTime: 18,
    manaCost: 8,
    damageMultiplier: 1.4,
    range: 1,
    areaOfEffect: 1,
    canCrit: true,
    canDodge: true,
    icon: '🌪️',
  },
  
  'power_strike': {
    id: 'power_strike',
    name: 'Power Strike',
    description: 'A heavy strike that deals massive damage',
    category: SkillCategory.PHYSICAL,
    tier: SkillTier.EXPERT,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.ENEMY,
    castTime: 25,
    manaCost: 15,
    damageMultiplier: 2.0,
    range: 1,
    canCrit: true,
    canDodge: true,
    icon: '💥',
  },
  
  // ========== MAGIC SKILLS - FIRE ==========
  
  'fireball': {
    id: 'fireball',
    name: 'Fireball',
    description: 'Hurls a ball of fire at the enemy',
    category: SkillCategory.MAGIC,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.ENEMY,
    element: 'fire' as any,
    castTime: 25,
    manaCost: 20,
    damageMultiplier: 1.8,
    range: 4,
    canCrit: true,
    canDodge: true,
    icon: '🔥',
  },
  
  'flame_strike': {
    id: 'flame_strike',
    name: 'Flame Strike',
    description: 'Calls down flames from the sky',
    category: SkillCategory.MAGIC,
    tier: SkillTier.EXPERT,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.AREA,
    element: 'fire' as any,
    castTime: 35,
    manaCost: 35,
    damageMultiplier: 2.2,
    range: 5,
    areaOfEffect: 2,
    canCrit: true,
    canDodge: true,
    icon: '☄️',
  },
  
  // ========== MAGIC SKILLS - ICE ==========
  
  'ice_shard': {
    id: 'ice_shard',
    name: 'Ice Shard',
    description: 'Launches a sharp ice projectile',
    category: SkillCategory.MAGIC,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.ENEMY,
    element: 'water' as any,
    castTime: 20,
    manaCost: 15,
    damageMultiplier: 1.4,
    range: 3,
    canCrit: true,
    canDodge: true,
    icon: '❄️',
  },
  
  'blizzard': {
    id: 'blizzard',
    name: 'Blizzard',
    description: 'Powerful area ice attack',
    category: SkillCategory.MAGIC,
    tier: SkillTier.MASTER,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.AREA,
    element: 'water' as any,
    castTime: 45,
    manaCost: 50,
    damageMultiplier: 2.5,
    range: 6,
    areaOfEffect: 3,
    canCrit: true,
    canDodge: true,
    icon: '🌨️',
  },
  
  // ========== HEALING SKILLS ==========
  
  'heal': {
    id: 'heal',
    name: 'Heal',
    description: 'Restores HP to target',
    category: SkillCategory.HEALING,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.HEAL,
    targetType: SkillTargetType.ALLY,
    castTime: 20,
    manaCost: 15,
    healAmount: 50,
    range: 3,
    icon: '💚',
  },
  
  'greater_heal': {
    id: 'greater_heal',
    name: 'Greater Heal',
    description: 'Restores a large amount of HP',
    category: SkillCategory.HEALING,
    tier: SkillTier.ADVANCED,
    effectType: SkillEffectType.HEAL,
    targetType: SkillTargetType.ALLY,
    castTime: 28,
    manaCost: 25,
    healAmount: 100,
    range: 3,
    icon: '💖',
  },
  
  'group_heal': {
    id: 'group_heal',
    name: 'Group Heal',
    description: 'Heals all allies in an area',
    category: SkillCategory.HEALING,
    tier: SkillTier.EXPERT,
    effectType: SkillEffectType.HEAL,
    targetType: SkillTargetType.AREA,
    castTime: 35,
    manaCost: 35,
    healAmount: 40,
    range: 4,
    areaOfEffect: 2,
    icon: '✨',
  },
  
  'regeneration': {
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Applies heal over time',
    category: SkillCategory.HEALING,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.HOT,
    targetType: SkillTargetType.ALLY,
    castTime: 15,
    manaCost: 10,
    healAmount: 10,
    effectDuration: 30, // 30 ticks = 3 seconds
    range: 3,
    icon: '🌿',
  },
  
  // ========== BUFF SKILLS ==========
  
  'power_up': {
    id: 'power_up',
    name: 'Power Up',
    description: 'Increases attack power',
    category: SkillCategory.BUFF,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.BUFF,
    targetType: SkillTargetType.ALLY,
    castTime: 15,
    manaCost: 10,
    effectValue: 20, // +20 attack
    effectDuration: 60,
    range: 3,
    icon: '💪',
  },
  
  'shield': {
    id: 'shield',
    name: 'Shield',
    description: 'Creates a protective barrier',
    category: SkillCategory.BUFF,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.SHIELD,
    targetType: SkillTargetType.ALLY,
    castTime: 18,
    manaCost: 12,
    effectValue: 30, // 30 damage shield
    range: 3,
    icon: '🛡️',
  },
  
  'haste': {
    id: 'haste',
    name: 'Haste',
    description: 'Increases action speed',
    category: SkillCategory.BUFF,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.BUFF,
    targetType: SkillTargetType.ALLY,
    castTime: 15,
    manaCost: 10,
    effectValue: 20, // +20 speed (faster ticks)
    effectDuration: 60,
    range: 3,
    icon: '⚡',
  },
  
  // ========== DEBUFF SKILLS ==========
  
  'poison': {
    id: 'poison',
    name: 'Poison',
    description: 'Applies poison damage over time',
    category: SkillCategory.DEBUFF,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.DOT,
    targetType: SkillTargetType.ENEMY,
    castTime: 15,
    manaCost: 8,
    damageMultiplier: 0.8,
    effectDuration: 30,
    range: 2,
    canDodge: true,
    icon: '☠️',
  },
  
  'slow': {
    id: 'slow',
    name: 'Slow',
    description: 'Reduces enemy action speed',
    category: SkillCategory.DEBUFF,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.DEBUFF,
    targetType: SkillTargetType.ENEMY,
    castTime: 12,
    manaCost: 10,
    effectValue: -20, // -20 speed
    effectDuration: 45,
    range: 3,
    canDodge: true,
    icon: '🐌',
  },
  
  'silence': {
    id: 'silence',
    name: 'Silence',
    description: 'Prevents target from using magic',
    category: SkillCategory.DEBUFF,
    tier: SkillTier.ADVANCED,
    effectType: SkillEffectType.SILENCE,
    targetType: SkillTargetType.ENEMY,
    castTime: 20,
    manaCost: 15,
    effectDuration: 30,
    range: 3,
    canDodge: true,
    icon: '🤫',
  },
  
  // ========== ULTIMATE SKILLS ==========
  
  'ultimate_strike': {
    id: 'ultimate_strike',
    name: 'Ultimate Strike',
    description: 'A devastating finishing move',
    category: SkillCategory.PHYSICAL,
    tier: SkillTier.ULTIMATE,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.ENEMY,
    castTime: 50,
    manaCost: 50,
    damageMultiplier: 3.0,
    range: 1,
    cooldown: 100,
    canCrit: true,
    canDodge: true,
    icon: '💎',
  },
  
  'meteor': {
    id: 'meteor',
    name: 'Meteor',
    description: 'Calls down a meteor from the sky',
    category: SkillCategory.MAGIC,
    tier: SkillTier.ULTIMATE,
    effectType: SkillEffectType.DAMAGE,
    targetType: SkillTargetType.AREA,
    element: 'fire' as any,
    castTime: 60,
    manaCost: 80,
    damageMultiplier: 3.5,
    range: 8,
    areaOfEffect: 4,
    cooldown: 150,
    canCrit: true,
    canDodge: true,
    icon: '☄️',
  },
  
  'divine_shield': {
    id: 'divine_shield',
    name: 'Divine Shield',
    description: 'Grants complete immunity',
    category: SkillCategory.BUFF,
    tier: SkillTier.ULTIMATE,
    effectType: SkillEffectType.SHIELD,
    targetType: SkillTargetType.SELF,
    castTime: 45,
    manaCost: 60,
    effectValue: 999, // Full immunity (high shield)
    effectDuration: 20,
    cooldown: 200,
    range: 0, // Self-target
    icon: '👼',
  },
  
  // ========== UTILITY SKILLS ==========
  
  'teleport': {
    id: 'teleport',
    name: 'Teleport',
    description: 'Teleport to any position',
    category: SkillCategory.UTILITY,
    tier: SkillTier.ADVANCED,
    effectType: SkillEffectType.TELEPORT,
    targetType: SkillTargetType.SELF,
    castTime: 30,
    manaCost: 25,
    range: 10,
    icon: '🌀',
  },
  
  'blink': {
    id: 'blink',
    name: 'Blink',
    description: 'Short range teleport',
    category: SkillCategory.UTILITY,
    tier: SkillTier.BASIC,
    effectType: SkillEffectType.TELEPORT,
    targetType: SkillTargetType.SELF,
    castTime: 15,
    manaCost: 15,
    range: 4,
    icon: '✨',
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get a skill template by ID
 */
export function getSkillTemplate(skillId: string): SkillTemplate | undefined {
  return SKILL_TEMPLATES[skillId];
}

/**
 * Get all skills by category
 */
export function getSkillsByCategory(category: SkillCategory): SkillTemplate[] {
  return Object.values(SKILL_TEMPLATES).filter(skill => skill.category === category);
}

/**
 * Get all skills by tier
 */
export function getSkillsByTier(tier: SkillTier): SkillTemplate[] {
  return Object.values(SKILL_TEMPLATES).filter(skill => skill.tier === tier);
}

/**
 * Get skills that require a specific weapon
 */
export function getSkillsByWeapon(weaponType: string): SkillTemplate[] {
  return Object.values(SKILL_TEMPLATES).filter(
    skill => skill.requiresWeapon?.includes(weaponType)
  );
}

/**
 * Get skills for a specific class
 */
export function getSkillsForClass(classId: string): SkillTemplate[] {
  return Object.values(SKILL_TEMPLATES).filter(
    skill => skill.requiresClass?.includes(classId)
  );
}

/**
 * Calculate actual cast time for a skill given unit's cast speed
 */
export function getActualCastTime(skillId: string, unitCastSpeed: number): number {
  const skill = getSkillTemplate(skillId);
  if (!skill) return 0;
  return calculateActualCastTime(skill.castTime, unitCastSpeed, skill.castSpeedBonus ?? 0);
}
