/**
 * Blink Skill
 * 
 * Short range teleport
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from './SkillTemplate.js';

export const BLINK_SKILL: SkillTemplate = {
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
};
