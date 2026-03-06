/**
 * Creatures Index
 * 
 * Central export point for all creature templates.
 * Structure:
 * - types/   : Type templates (base stats for BEAST, UNDEAD, DRAGON, etc.)
 * - variants/: Specific creature families (slimes, skeletons, dragons, etc.)
 */

import { CreatureTemplate, CreatureType, CreatureRank, CreatureTier, CreatureStatGrowth, CreatureDrops, RANK_MULTIPLIERS, TIER_SCALING, CreatureKind, CreatureTypeTemplate } from './CreatureBase.js';

// Import from variants folder (subfolders)
import { slimeTemplates } from './variants/slimes/index.js';
import { skeletonTemplates } from './variants/skeletons/index.js';
import { dragonTemplates } from './variants/dragons/index.js';

// Import from types folder
import { TYPE_TEMPLATES, TYPE_VARIANTS, getTypeTemplate } from './types/index.js';

// ========== CREATURE REGISTRY ==========

export const CREATURE_TEMPLATES: Record<string, CreatureTemplate> = {
  ...slimeTemplates,
  ...skeletonTemplates,
  ...dragonTemplates,
};

// ========== CONVENIENCE FUNCTIONS ==========

/**
 * Get a creature template by ID
 */
export function getCreatureTemplate(id: string): CreatureTemplate | undefined {
  return CREATURE_TEMPLATES[id];
}

/**
 * Get all creatures of a specific type
 */
export function getCreaturesByType(type: CreatureType): CreatureTemplate[] {
  return Object.values(CREATURE_TEMPLATES).filter(
    c => c.creatureType === type
  );
}

/**
 * Get all creatures of a specific tier
 */
export function getCreaturesByTier(tier: CreatureTier): CreatureTemplate[] {
  return Object.values(CREATURE_TEMPLATES).filter(
    c => c.tier === tier
  );
}

/**
 * Get all creatures of a specific rank
 */
export function getCreaturesByRank(rank: CreatureRank): CreatureTemplate[] {
  return Object.values(CREATURE_TEMPLATES).filter(
    c => c.rank === rank
  );
}

/**
 * Get all boss creatures
 */
export function getBossCreatures(): CreatureTemplate[] {
  return Object.values(CREATURE_TEMPLATES).filter(
    c => c.rank === CreatureRank.BOSS || c.rank === CreatureRank.WORLD_BOSS
  );
}

/**
 * Get base creatures only (no variants)
 */
export function getBaseCreatures(): CreatureTemplate[] {
  return Object.values(CREATURE_TEMPLATES).filter(
    c => c.id.startsWith('base_')
  );
}

// ========== RE-EXPORTS ==========

export { CreatureTemplate, CreatureType, CreatureRank, CreatureTier, CreatureStatGrowth, CreatureDrops, RANK_MULTIPLIERS, TIER_SCALING, CreatureKind, CreatureTypeTemplate } from './CreatureBase.js';

// Re-export creature variants
export { slimeTemplates } from './variants/slimes/index.js';
export { skeletonTemplates } from './variants/skeletons/index.js';
export { dragonTemplates } from './variants/dragons/index.js';

// Re-export type templates
export { TYPE_TEMPLATES, TYPE_VARIANTS, getTypeTemplate } from './types/index.js';

// Re-export factory functions
export {
  createCreature,
  createMonsterFromTemplate,
  createPlayer,
  createNPC,
  createMonsterParty,
  calculateMonsterRewards,
  createSlime,
  createFireSlime,
  createWaterSlime,
  createDarkSlime,
  createSkeleton,
  createSkeletonArcher,
  createSkeletonKnight,
  createDragon,
  createDragonMage,
  createBoss,
  ELEMENT_MODIFIERS,
  CLASS_MODIFIERS,
  type ElementModifier,
  type ClassModifier,
  type CreateCreatureOptions,
} from './factory.js';
