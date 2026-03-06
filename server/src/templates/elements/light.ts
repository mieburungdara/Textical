/**
 * Light Element Template
 * 
 * Light banishes darkness.
 * - Beats: DARK (1.5x damage - balanced)
 * - Weak to: DARK (1.5x damage - balanced)
 * - Status Effect: BLIND (accuracy reduction)
 */

import { ElementTemplate, ElementType, ElementStatusEffect } from './Element.js';

const blindStatusEffect: ElementStatusEffect = {
  name: 'Blind',
  type: 'stat_debuff',
  statAffected: 'accuracy',
  statValue: -40,
  duration: 6,
  tickInterval: 1,
};

export const light: ElementTemplate = {
  id: 'light',
  name: 'Light',
  type: ElementType.LIGHT,
  icon: '✨',
  color: '#FFE066',
  
  beats: ElementType.DARK,
  weakTo: ElementType.DARK,
  
  statusEffect: blindStatusEffect,
  
  particleEffect: 'holy_light',
  soundEffect: 'light_cast',
  
  description: 'Banishes darkness. Balanced with Dark. Causes Blind (accuracy -40%).',
};
