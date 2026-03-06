/**
 * Greater Heal Skill
 * 
 * Restores a large amount of HP
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from './SkillTemplate.js';

export const GREATER_HEAL_SKILL: SkillTemplate = {
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
};
