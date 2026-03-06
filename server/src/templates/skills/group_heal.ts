/**
 * Group Heal Skill
 * 
 * Heals all allies in an area
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from './SkillTemplate.js';

export const GROUP_HEAL_SKILL: SkillTemplate = {
  id: 'group_heal',
  name: 'Group Heal',
  description: 'Heals all allies in an area',
  category: SkillCategory.HEALING,
  tier: SkillTier.EXPERT,
  effectType: SkillEffectType.HEAL,
  targetType: SkillTargetType.AREA,
  castTime: 35,
  manaCost: 35,
  healAmount: 40,
  range: 4,
  areaOfEffect: 2,
  icon: '✨',
};
