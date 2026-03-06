/**
 * Power Up Skill
 * 
 * Increases attack power
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from '../SkillTemplate.js';

export const POWER_UP_SKILL: SkillTemplate = {
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
};
