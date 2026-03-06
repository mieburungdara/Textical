/**
 * Earth Element Template
 * 
 * Earth crushes and buries.
 * - Beats: WATER (2x damage)
 * - Weak to: WIND (0.5x damage)
 * - Status Effect: HEAVY (defense reduction)
 */

import { ElementTemplate, ElementType, ElementStatusEffect } from './Element.js';

const heavyStatusEffect: ElementStatusEffect = {
  name: 'Heavy',
  type: 'stat_debuff',
  statAffected: 'defense',
  statValue: -25,
  duration: 10,
  tickInterval: 1,
};

export const earth: ElementTemplate = {
  id: 'earth',
  name: 'Earth',
  type: ElementType.EARTH,
  icon: '🪨',
  color: '#8B5A2B',
  
  beats: ElementType.WATER,
  weakTo: ElementType.WIND,
  
  statusEffect: heavyStatusEffect,
  
  particleEffect: 'rock_impact',
  soundEffect: 'earth_cast',
  
  description: 'Crushes and buries. Strong vs Water, Weak to Wind. Causes Heavy (defense -25%).',
};
