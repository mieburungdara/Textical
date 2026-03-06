/**
 * Slimes - Creature Family
 * 
 * Exports all slime variants.
 */

import { CreatureTemplate } from '../../CreatureBase.js';
import { baseSlime } from './slime.js';
import { fireSlime } from './fire_slime.js';
import { kingSlime } from './king_slime.js';

export const slimeTemplates: Record<string, CreatureTemplate> = {
  base_slime: baseSlime,
  fire_slime: fireSlime,
  king_slime: kingSlime,
};

// Convenience exports
export { baseSlime, fireSlime, kingSlime };

// Family metadata
export const slimeFamily = {
  name: 'Slime',
  type: ' BEAST',
  variants: Object.keys(slimeTemplates),
};
