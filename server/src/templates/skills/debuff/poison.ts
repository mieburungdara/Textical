/**
 * Poison Skill
 * 
 * Applies poison damage over time
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from '../SkillTemplate.js';

export const POISON_SKILL: SkillTemplate = {
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
};
