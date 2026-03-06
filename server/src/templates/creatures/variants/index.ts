/**
 * Variants Index
 * 
 * Central export for all creature variants (families).
 * Uses subfolder structure: slimes/, skeletons/, dragons/
 */

import { CreatureTemplate, CreatureType, CreatureRank, CreatureTier } from '../CreatureBase.js';

// Import all creature families from subfolders
export { slimeTemplates, baseSlime, fireSlime, kingSlime, slimeFamily } from './slimes/index.js';
export { skeletonTemplates, baseSkeleton, skeletonMage, lich, skeletonFamily } from './skeletons/index.js';
export { dragonTemplates, baseDragon, ancientDragon, dragonMage, dragonFamily } from './dragons/index.js';

// Creature registry - combines all variant templates
import { slimeTemplates } from './slimes/index.js';
import { skeletonTemplates } from './skeletons/index.js';
import { dragonTemplates } from './dragons/index.js';

export const VARIANT_TEMPLATES: Record<string, CreatureTemplate> = {
  ...slimeTemplates,
  ...skeletonTemplates,
  ...dragonTemplates,
};

/**
 * Get variant template by ID
 */
export function getVariantTemplate(id: string): CreatureTemplate | undefined {
  return VARIANT_TEMPLATES[id];
}
