/**
 * Heal Skill
 * 
 * Restores HP to target
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from '../SkillTemplate.js';

export const HEAL_SKILL: SkillTemplate = {
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
};
