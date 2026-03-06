/**
 * Thrust Skill
 * 
 * A precise thrust attack
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from './SkillTemplate.js';

export const THRUST_SKILL: SkillTemplate = {
  id: 'thrust',
  name: 'Thrust',
  description: 'A precise thrust attack',
  category: SkillCategory.PHYSICAL,
  tier: SkillTier.BASIC,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.ENEMY,
  castTime: 10,
  manaCost: 3,
  damageMultiplier: 1.1,
  range: 1,
  canCrit: true,
  canDodge: true,
  icon: '🗡️',
};
