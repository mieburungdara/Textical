/**
 * Divine Shield Skill
 * 
 * Grants complete immunity
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from '../SkillTemplate.js';

export const DIVINE_SHIELD_SKILL: SkillTemplate = {
  id: 'divine_shield',
  name: 'Divine Shield',
  description: 'Grants complete immunity',
  category: SkillCategory.BUFF,
  tier: SkillTier.ULTIMATE,
  effectType: SkillEffectType.SHIELD,
  targetType: SkillTargetType.SELF,
  castTime: 45,
  manaCost: 60,
  effectValue: 999, // Full immunity (high shield)
  effectDuration: 20,
  cooldown: 200,
  range: 0, // Self-target
  icon: '👼',
};
