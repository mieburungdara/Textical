/**
 * Slash Skill
 * 
 * A powerful sword slash that deals damage
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType } from './SkillTemplate.js';

export const SLASH_SKILL: SkillTemplate = {
  id: 'slash',
  name: 'Slash',
  description: 'A powerful sword slash that deals damage',
  category: SkillCategory.PHYSICAL,
  tier: SkillTier.BASIC,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.ENEMY,
  castTime: 12,
  manaCost: 5,
  damageMultiplier: 1.2,
  range: 1,
  canCrit: true,
  canDodge: true,
  icon: '⚔️',
};
