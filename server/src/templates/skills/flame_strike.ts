/**
 * Flame Strike Skill
 * 
 * Calls down flames from the sky
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType, ElementType } from './SkillTemplate.js';

export const FLAME_STRIKE_SKILL: SkillTemplate = {
  id: 'flame_strike',
  name: 'Flame Strike',
  description: 'Calls down flames from the sky',
  category: SkillCategory.MAGIC,
  tier: SkillTier.EXPERT,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.AREA,
  element: ElementType.FIRE,
  castTime: 35,
  manaCost: 35,
  damageMultiplier: 2.2,
  range: 5,
  areaOfEffect: 2,
  canCrit: true,
  canDodge: true,
  icon: '☄️',
};
