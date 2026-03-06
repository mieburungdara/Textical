/**
 * Ultimate Strike Skill
 * 
 * A devastating finishing move
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from '../SkillTemplate.js';

export const ULTIMATE_STRIKE_SKILL: SkillTemplate = {
  id: 'ultimate_strike',
  name: 'Ultimate Strike',
  description: 'A devastating finishing move',
  category: SkillCategory.PHYSICAL,
  tier: SkillTier.ULTIMATE,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.ENEMY,
  castTime: 50,
  manaCost: 50,
  damageMultiplier: 3.0,
  range: 1,
  cooldown: 100,
  canCrit: true,
  canDodge: true,
  icon: '💎',
};
