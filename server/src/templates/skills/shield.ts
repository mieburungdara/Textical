/**
 * Shield Skill
 * 
 * Creates a protective barrier
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from './SkillTemplate.js';

export const SHIELD_SKILL: SkillTemplate = {
  id: 'shield',
  name: 'Shield',
  description: 'Creates a protective barrier',
  category: SkillCategory.BUFF,
  tier: SkillTier.BASIC,
  effectType: SkillEffectType.SHIELD,
  targetType: SkillTargetType.ALLY,
  castTime: 18,
  manaCost: 12,
  effectValue: 30,
  range: 3,
  icon: '🛡️',
};
