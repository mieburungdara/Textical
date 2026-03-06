/**
 * Spin Attack Skill
 * 
 * Area attack that hits all surrounding enemies
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from './SkillTemplate.js';

export const SPIN_SKILL: SkillTemplate = {
  id: 'spin',
  name: 'Spin Attack',
  description: 'Area attack that hits all surrounding enemies',
  category: SkillCategory.PHYSICAL,
  tier: SkillTier.ADVANCED,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.AREA,
  castTime: 18,
  manaCost: 8,
  damageMultiplier: 1.4,
  range: 1,
  areaOfEffect: 1,
  canCrit: true,
  canDodge: true,
  icon: '🌪️',
};
