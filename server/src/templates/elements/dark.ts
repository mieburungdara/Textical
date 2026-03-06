/**
 * Dark Element Template
 * 
 * Dark corrupts and weakens.
 * - Beats: LIGHT (1.5x damage - balanced)
 * - Weak to: LIGHT (1.5x damage - balanced)
 * - Status Effect: CURSE (heal reduction)
 */

import { ElementTemplate, ElementType, ElementStatusEffect } from './Element.js';

const curseStatusEffect: ElementStatusEffect = {
  name: 'Curse',
  type: 'stat_debuff',
  statAffected: 'healing',
  statValue: -50,
  duration: 10,
  tickInterval: 1,
};

export const dark: ElementTemplate = {
  id: 'dark',
  name: 'Dark',
  type: ElementType.DARK,
  icon: '🌑',
  color: '#845EF7',
  
  beats: ElementType.LIGHT,
  weakTo: ElementType.LIGHT,
  
  statusEffect: curseStatusEffect,
  
  particleEffect: 'shadow',
  soundEffect: 'dark_cast',
  
  description: 'Corrupts and weakens. Balanced with Light. Causes Curse (healing -50%).',
};
