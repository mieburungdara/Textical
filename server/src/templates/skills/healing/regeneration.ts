/**
 * Regeneration Skill
 * 
 * Applies heal over time
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from '../SkillTemplate.js';

export const REGENERATION_SKILL: SkillTemplate = {
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
};
