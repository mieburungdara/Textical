/**
 * Blizzard Skill
 * 
 * Powerful area ice attack
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType, ElementType } from './SkillTemplate.js';

export const BLIZZARD_SKILL: SkillTemplate = {
  id: 'blizzard',
  name: 'Blizzard',
  description: 'Powerful area ice attack',
  category: SkillCategory.MAGIC,
  tier: SkillTier.MASTER,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.AREA,
  element: ElementType.WATER,
  castTime: 45,
  manaCost: 50,
  damageMultiplier: 2.5,
  range: 6,
  areaOfEffect: 3,
  canCrit: true,
  canDodge: true,
  icon: '🌨️',
};
