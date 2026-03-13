/**
 * Material Registry
 * 
 * Central export point for all material templates.
 * Provides lookup functions for materials by various criteria.
 */

import { 
  MaterialTemplate, 
  MaterialCategory, 
  MaterialTier, 
  MaterialRarity, 
  MaterialSource,
  MaterialUse,
  MaterialRegistry,
  getMaterialRarityColor,
  getRarityMultiplier
} from './MaterialTemplate.js';

// Import all material categories
export { ORE_MATERIALS, type OreMaterialId } from './ores.js';
export { WOOD_MATERIALS, type WoodMaterialId } from './woods.js';
export { HIDE_MATERIALS, type HideMaterialId } from './hides.js';
export { HERB_MATERIALS, type HerbMaterialId } from './herbs.js';
export { BONE_MATERIALS, type BoneMaterialId } from './bones.js';
export { ESSENCE_MATERIALS, type EssenceMaterialId } from './essences.js';
export { FIBER_MATERIALS, type FiberMaterialId } from './fibers.js';

// Re-export enums and helpers
export { 
  MaterialCategory, 
  MaterialTier, 
  MaterialRarity, 
  MaterialSource,
  MaterialUse,
  MaterialTemplate,
  MaterialEffect,
  createMaterialTemplate,
  getMaterialRarityColor,
  getRarityMultiplier
} from './MaterialTemplate.js';

// ========== MATERIAL REGISTRY ==========

const ALL_MATERIALS: Record<string, MaterialTemplate> = {
  // Ores
  ...(await import('./ores.js')).ORE_MATERIALS,
  // Woods
  ...(await import('./woods.js')).WOOD_MATERIALS,
  // Hides
  ...(await import('./hides.js')).HIDE_MATERIALS,
  // Herbs
  ...(await import('./herbs.js')).HERB_MATERIALS,
  // Bones
  ...(await import('./bones.js')).BONE_MATERIALS,
  // Essences
  ...(await import('./essences.js')).ESSENCE_MATERIALS,
  // Fibers
  ...(await import('./fibers.js')).FIBER_MATERIALS,
};

// ========== LOOKUP FUNCTIONS ==========

/**
 * Get a material by ID
 */
export function getMaterial(id: string): MaterialTemplate | undefined {
  return ALL_MATERIALS[id];
}

/**
 * Get all materials
 */
export function getAllMaterials(): MaterialTemplate[] {
  return Object.values(ALL_MATERIALS);
}

/**
 * Get materials by category
 */
export function getMaterialsByCategory(category: MaterialCategory): MaterialTemplate[] {
  return getAllMaterials().filter(m => m.category === category);
}

/**
 * Get materials by rarity
 */
export function getMaterialsByRarity(rarity: MaterialRarity): MaterialTemplate[] {
  return getAllMaterials().filter(m => m.rarity === rarity);
}

/**
 * Get materials by tier
 */
export function getMaterialsByTier(tier: MaterialTier): MaterialTemplate[] {
  return getAllMaterials().filter(m => m.tier === tier);
}

/**
 * Get materials by source
 */
export function getMaterialsBySource(source: MaterialSource): MaterialTemplate[] {
  return getAllMaterials().filter(m => m.sources.includes(source));
}

/**
 * Get materials by use
 */
export function getMaterialsByUse(use: MaterialUse): MaterialTemplate[] {
  return getAllMaterials().filter(m => m.possibleUses.includes(use));
}

/**
 * Get materials by minimum level requirement
 */
export function getMaterialsByMinLevel(level: number): MaterialTemplate[] {
  return getAllMaterials().filter(m => (m.requiredLevel || 0) >= level);
}

/**
 * Get materials by ID prefix (e.g., 'iron', 'dragon', etc.)
 */
export function getMaterialsByPrefix(prefix: string): MaterialTemplate[] {
  const lowerPrefix = prefix.toLowerCase();
  return getAllMaterials().filter(m => m.id.startsWith(lowerPrefix));
}

/**
 * Get all material IDs
 */
export function getAllMaterialIds(): string[] {
  return Object.keys(ALL_MATERIALS);
}

/**
 * Get material count by category
 */
export function getMaterialCountByCategory(): Record<MaterialCategory, number> {
  const counts: Record<MaterialCategory, number> = {
    [MaterialCategory.ORE]: 0,
    [MaterialCategory.WOOD]: 0,
    [MaterialCategory.HIDE]: 0,
    [MaterialCategory.HERB]: 0,
    [MaterialCategory.FIBER]: 0,
    [MaterialCategory.BONE]: 0,
    [MaterialCategory.ESSENCE]: 0,
    [MaterialCategory.METAL]: 0,
    [MaterialCategory.GEM]: 0,
    [MaterialCategory.CLOTH]: 0,
    [MaterialCategory.POTION_INGREDIENT]: 0,
    [MaterialCategory.FOOD_INGREDIENT]: 0,
    [MaterialCategory.TREASURE]: 0,
    [MaterialCategory.CURRENCY]: 0,
  };
  const categories: MaterialCategory[] = [
    MaterialCategory.ORE,
    MaterialCategory.WOOD,
    MaterialCategory.HIDE,
    MaterialCategory.HERB,
    MaterialCategory.FIBER,
    MaterialCategory.BONE,
    MaterialCategory.ESSENCE,
    MaterialCategory.METAL,
    MaterialCategory.GEM,
    MaterialCategory.CLOTH,
    MaterialCategory.POTION_INGREDIENT,
    MaterialCategory.FOOD_INGREDIENT,
    MaterialCategory.TREASURE,
    MaterialCategory.CURRENCY,
  ];
  for (const category of categories) {
    counts[category] = getMaterialsByCategory(category).length;
  }
  return counts;
}

/**
 * Get material count by tier
 */
export function getMaterialCountByTier(): Record<MaterialTier, number> {
  const counts: Record<MaterialTier, number> = {
    [MaterialTier.TIER_1]: 0,
    [MaterialTier.TIER_2]: 0,
    [MaterialTier.TIER_3]: 0,
    [MaterialTier.TIER_4]: 0,
    [MaterialTier.TIER_5]: 0,
    [MaterialTier.TIER_6]: 0,
  };
  const tiers: MaterialTier[] = [
    MaterialTier.TIER_1,
    MaterialTier.TIER_2,
    MaterialTier.TIER_3,
    MaterialTier.TIER_4,
    MaterialTier.TIER_5,
    MaterialTier.TIER_6,
  ];
  for (const tier of tiers) {
    counts[tier] = getMaterialsByTier(tier).length;
  }
  return counts;
}

// ========== CONVENIENCE LOOKUPS ==========

/**
 * Get all Tier 1 materials (basic/beginner)
 */
export function getBasicMaterials(): MaterialTemplate[] {
  return getMaterialsByTier(MaterialTier.TIER_1);
}

/**
 * Get all materials that can be used for crafting
 */
export function getCraftingMaterials(): MaterialTemplate[] {
  return getMaterialsByUse(MaterialUse.CRAFTING);
}

/**
 * Get all materials that can be sold
 */
export function getSellableMaterials(): MaterialTemplate[] {
  return getMaterialsByUse(MaterialUse.SELLING);
}

/**
 * Get all materials from monster drops
 */
export function getMonsterDropMaterials(): MaterialTemplate[] {
  return getMaterialsBySource(MaterialSource.MOB_DROP);
}

/**
 * Get all materials from boss drops
 */
export function getBossDropMaterials(): MaterialTemplate[] {
  return getMaterialsBySource(MaterialSource.BOSS_DROP);
}

/**
 * Get all legendary materials
 */
export function getLegendaryMaterials(): MaterialTemplate[] {
  return getMaterialsByRarity(MaterialRarity.LEGENDARY);
}

/**
 * Get all epic materials
 */
export function getEpicMaterials(): MaterialTemplate[] {
  return getMaterialsByRarity(MaterialRarity.EPIC);
}

// ========== MATERIAL REGISTRY OBJECT ==========

export const materialRegistry: MaterialRegistry = {
  materials: new Map(Object.entries(ALL_MATERIALS)),
  getMaterial,
  getMaterialsByCategory,
  getMaterialsByRarity,
  getMaterialsByTier,
  getMaterialsBySource,
  getMaterialsByUse,
};

// ========== STATISTICS ==========

export const materialStats = {
  totalMaterials: Object.keys(ALL_MATERIALS).length,
  byCategory: getMaterialCountByCategory(),
  byTier: getMaterialCountByTier(),
  byRarity: {
    [MaterialRarity.COMMON]: getMaterialsByRarity(MaterialRarity.COMMON).length,
    [MaterialRarity.UNCOMMON]: getMaterialsByRarity(MaterialRarity.UNCOMMON).length,
    [MaterialRarity.RARE]: getMaterialsByRarity(MaterialRarity.RARE).length,
    [MaterialRarity.EPIC]: getMaterialsByRarity(MaterialRarity.EPIC).length,
    [MaterialRarity.LEGENDARY]: getMaterialsByRarity(MaterialRarity.LEGENDARY).length,
  },
};
