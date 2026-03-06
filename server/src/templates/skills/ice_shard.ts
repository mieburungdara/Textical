/**
 * Ice Shard Skill
 * 
 * Launches a sharp ice projectile
 */

import { SkillTemplate, SkillCategory, SkillTargetType, SkillTier, SkillEffectType, ElementType } from './SkillTemplate.js';

export const ICE_SHARD_SKILL: SkillTemplate = {
  id: 'ice_shard',
  name: 'Ice Shard',
  description: 'Launches a sharp ice projectile',
  category: SkillCategory.MAGIC,
  tier: SkillTier.BASIC,
  effectType: SkillEffectType.DAMAGE,
  targetType: SkillTargetType.ENEMY,
  element: ElementType.WATER,
  castTime: 20,
  manaCost: 15,
  damageMultiplier: 1.4,
  range: 3,
  canCrit: true,
  canDodge: true,
  icon: '❄️',
};
