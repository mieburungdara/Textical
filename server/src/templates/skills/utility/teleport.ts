/**
 * Teleport Skill
 * 
 * Teleport to any position
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from '../SkillTemplate.js';

export const TELEPORT_SKILL: SkillTemplate = {
  id: 'teleport',
  name: 'Teleport',
  description: 'Teleport to any position',
  category: SkillCategory.UTILITY,
  tier: SkillTier.ADVANCED,
  effectType: SkillEffectType.TELEPORT,
  targetType: SkillTargetType.SELF,
  castTime: 30,
  manaCost: 25,
  range: 10,
  icon: '🌀',
};
