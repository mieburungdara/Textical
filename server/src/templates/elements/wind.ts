/**
 * Wind Element Template
 * 
 * Wind cuts and displaces.
 * - Beats: EARTH (2x damage)
 * - Weak to: FIRE (0.5x damage)
 * - Status Effect: BLEED (damage over time)
 */

import { ElementTemplate, ElementType, ElementStatusEffect } from './Element.js';

const bleedStatusEffect: ElementStatusEffect = {
  name: 'Bleed',
  type: 'damage_over_time',
  damage: 3,
  duration: 8,
  tickInterval: 1,
};

export const wind: ElementTemplate = {
  id: 'wind',
  name: 'Wind',
  type: ElementType.WIND,
  icon: '🌪️',
  color: '#69DB7C',
  
  beats: ElementType.EARTH,
  weakTo: ElementType.FIRE,
  
  statusEffect: bleedStatusEffect,
  
  particleEffect: 'wind_slice',
  soundEffect: 'wind_cast',
  
  description: 'Cuts and displaces. Strong vs Earth, Weak to Fire. Causes Bleed (DoT).',
};
