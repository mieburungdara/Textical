/**
 * Dragons - Creature Family
 * 
 * Exports all dragon variants.
 */

import { CreatureTemplate } from '../../CreatureBase.js';
import { baseDragon } from './dragon.js';
import { ancientDragon } from './ancient_dragon.js';
import { dragonMage } from './dragon_mage.js';

export const dragonTemplates: Record<string, CreatureTemplate> = {
  base_dragon: baseDragon,
  ancient_dragon: ancientDragon,
  dragon_mage: dragonMage,
};

// Convenience exports
export { baseDragon, ancientDragon, dragonMage };

// Family metadata
export const dragonFamily = {
  name: 'Dragon',
  type: 'DRAGON',
  variants: Object.keys(dragonTemplates),
};
