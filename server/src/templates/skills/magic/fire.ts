/**
 * Fireball Skill
 * 
 * Hurls a ball of fire at the enemy
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType, ElementType } from '../SkillTemplate.js';

export const FIREBALL_SKILL: SkillTemplate = {
  id: 'fireball',
  name: 'Fireball',
  description: 'Hurls a ball of fire at the enemy',
  category: SkillCategory.MAGIC,
  tier: SkillTier.BASIC,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.ENEMY,
  element: ElementType.FIRE,
  castTime: 25,
  manaCost: 20,
  damageMultiplier: 1.8,
  range: 4,
  canCrit: true,
  canDodge: true,
  icon: '🔥',
};
