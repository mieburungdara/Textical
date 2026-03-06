/**
 * Power Strike Skill
 * 
 * A heavy strike that deals massive damage
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from './SkillTemplate.js';

export const POWER_STRIKE_SKILL: SkillTemplate = {
  id: 'power_strike',
  name: 'Power Strike',
  description: 'A heavy strike that deals massive damage',
  category: SkillCategory.PHYSICAL,
  tier: SkillTier.EXPERT,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.ENEMY,
  castTime: 25,
  manaCost: 15,
  damageMultiplier: 2.0,
  range: 1,
  canCrit: true,
  canDodge: true,
  icon: '💥',
};
