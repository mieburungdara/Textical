/**
 * Skeletons - Creature Family
 * 
 * Exports all skeleton variants.
 */

import { CreatureTemplate } from '../../CreatureBase.js';
import { baseSkeleton } from './skeleton.js';
import { skeletonMage } from './skeleton_mage.js';
import { lich } from './lich.js';

export const skeletonTemplates: Record<string, CreatureTemplate> = {
  base_skeleton: baseSkeleton,
  skeleton_mage: skeletonMage,
  lich: lich,
};

// Convenience exports
export { baseSkeleton, skeletonMage, lich };

// Family metadata
export const skeletonFamily = {
  name: 'Skeleton',
  type: 'UNDEAD',
  variants: Object.keys(skeletonTemplates),
};
