/**
 * Silence Skill
 * 
 * Prevents target from using magic
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from '../SkillTemplate.js';

export const SILENCE_SKILL: SkillTemplate = {
  id: 'silence',
  name: 'Silence',
  description: 'Prevents target from using magic',
  category: SkillCategory.DEBUFF,
  tier: SkillTier.ADVANCED,
  effectType: SkillEffectType.SILENCE,
  targetType: SkillTargetType.ENEMY,
  castTime: 20,
  manaCost: 15,
  effectDuration: 30,
  range: 3,
  canDodge: true,
  icon: '🤫',
};
