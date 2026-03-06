/**
 * Fire Element Template
 * 
 * Fire burns enemies.
 * - Beats: WIND (2x damage)
 * - Weak to: WATER (0.5x damage)
 * - Status Effect: BURN (damage over time)
 */

import { ElementTemplate, ElementType, ElementStatusEffect } from './Element.js';

const burnStatusEffect: ElementStatusEffect = {
  name: 'Burn',
  type: 'damage_over_time',
  damage: 5,
  duration: 10,
  tickInterval: 1,
};

export const fire: ElementTemplate = {
  id: 'fire',
  name: 'Fire',
  type: ElementType.FIRE,
  icon: '🔥',
  color: '#FF6B35',
  
  beats: ElementType.WIND,
  weakTo: ElementType.WATER,
  
  statusEffect: burnStatusEffect,
  
  particleEffect: 'flame',
  soundEffect: 'fire_cast',
  
  description: 'Burns enemies with flames. Strong vs Wind, Weak to Water. Causes Burn (DoT).',
};
