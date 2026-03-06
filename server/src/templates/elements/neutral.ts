/**
 * Neutral Element Template
 * 
 * Non-elemental damage.
 * Has no strengths or weaknesses.
 */

import { ElementTemplate, ElementType, ElementStatusEffect } from './Element.js';

const neutralStatusEffect: ElementStatusEffect = {
  name: 'None',
  type: 'none',
  duration: 0,
  tickInterval: 0,
};

export const neutral: ElementTemplate = {
  id: 'neutral',
  name: 'Neutral',
  type: ElementType.NEUTRAL,
  icon: '💫',
  color: '#ADB5BD',
  
  // No elemental relationships
  beats: null,
  weakTo: null,
  
  // No status effect
  statusEffect: neutralStatusEffect,
  
  // Visual
  particleEffect: 'none',
  soundEffect: 'impact',
  
  description: 'Non-elemental damage. Has no strengths or weaknesses.',
};
