/**
 * Slow Skill
 * 
 * Reduces enemy action speed
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from '../SkillTemplate.js';

export const SLOW_SKILL: SkillTemplate = {
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
};
