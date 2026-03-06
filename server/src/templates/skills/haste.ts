/**
 * Haste Skill
 * 
 * Increases action speed
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from './SkillTemplate.js';

export const HASTE_SKILL: SkillTemplate = {
  id: 'haste',
  name: 'Haste',
  description: 'Increases action speed',
  category: SkillCategory.BUFF,
  tier: SkillTier.BASIC,
  effectType: SkillEffectType.BUFF,
  targetType: SkillTargetType.ALLY,
  castTime: 15,
  manaCost: 10,
  effectValue: 20,
  effectDuration: 60,
  range: 3,
  icon: '⚡',
};
