/**
 * Water Element Template
 * 
 * Water drowns and extinguishes.
 * - Beats: FIRE (2x damage)
 * - Weak to: EARTH (0.5x damage)
 * - Status Effect: WET (movement speed reduction)
 */

import { ElementTemplate, ElementType, ElementStatusEffect } from './Element.js';

const wetStatusEffect: ElementStatusEffect = {
  name: 'Wet',
  type: 'stat_debuff',
  statAffected: 'speed',
  statValue: -30,
  duration: 8,
  tickInterval: 1,
};

export const water: ElementTemplate = {
  id: 'water',
  name: 'Water',
  type: ElementType.WATER,
  icon: '💧',
  color: '#4DABF7',
  
  beats: ElementType.FIRE,
  weakTo: ElementType.EARTH,
  
  statusEffect: wetStatusEffect,
  
  particleEffect: 'water_splash',
  soundEffect: 'water_cast',
  
  description: 'Drowns and extinguishes. Strong vs Fire, Weak to Earth. Causes Wet (speed -30%).',
};
