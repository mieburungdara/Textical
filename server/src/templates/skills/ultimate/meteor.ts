/**
 * Meteor Skill
 * 
 * Calls down a meteor from the sky
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType, ElementType } from '../SkillTemplate.js';

export const METEOR_SKILL: SkillTemplate = {
  id: 'meteor',
  name: 'Meteor',
  description: 'Calls down a meteor from the sky',
  category: SkillCategory.MAGIC,
  tier: SkillTier.ULTIMATE,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.AREA,
  element: ElementType.FIRE,
  castTime: 60,
  manaCost: 80,
  damageMultiplier: 3.5,
  range: 8,
  areaOfEffect: 4,
  cooldown: 150,
  canCrit: true,
  canDodge: true,
  icon: '☄️',
};
