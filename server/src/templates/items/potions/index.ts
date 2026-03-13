/**
 * Potion Registry
 * 
 * Central export point for all potion templates.
 * Provides lookup functions for potions by various criteria.
 */

import { 
  PotionTemplate, 
  PotionCategory, 
  PotionType,
  PotionRarity, 
  PotionSource,
  PotionTargetType,
  PotionEffect,
  PotionEffectType,
  PotionRecipe,
  getPotionRarityColor,
  getPotionTier
} from './PotionTemplate.js';

// Import all potion categories
import { HEALTH_POTIONS } from './health.js';
import { MANA_POTIONS } from './mana.js';
import { BUFF_POTIONS } from './buffs.js';
import { CURE_POTIONS } from './cure.js';
import { RESISTANCE_POTIONS } from './resistance.js';
import { SPECIAL_POTIONS } from './special.js';

// Re-export enums and helpers
export { 
  PotionCategory, 
  PotionType,
  PotionRarity, 
  PotionSource,
  PotionTargetType,
  PotionEffect,
  PotionEffectType,
  PotionTemplate,
  PotionRecipe,
  createPotionTemplate,
  getPotionRarityColor,
  getPotionTier
} from './PotionTemplate.js';

// Export all potion categories
export { HEALTH_POTIONS, type HealthPotionId } from './health.js';
export { MANA_POTIONS, type ManaPotionId } from './mana.js';
export { BUFF_POTIONS, type BuffPotionId } from './buffs.js';
export { CURE_POTIONS, type CurePotionId } from './cure.js';
export { RESISTANCE_POTIONS, type ResistancePotionId } from './resistance.js';
export { SPECIAL_POTIONS, type SpecialPotionId } from './special.js';

// ========== POTION REGISTRY ==========

const ALL_POTIONS: Record<string, PotionTemplate> = {
  // Health
  ...HEALTH_POTIONS,
  
  // Mana
  ...MANA_POTIONS,
  
  // Buff
  ...BUFF_POTIONS,
  
  // Cure
  ...CURE_POTIONS,
  
  // Resistance
  ...RESISTANCE_POTIONS,
  
  // Special
  ...SPECIAL_POTIONS,
};

// ========== LOOKUP FUNCTIONS ==========

/**
 * Get a potion by ID
 */
export function getPotion(id: string): PotionTemplate | undefined {
  return ALL_POTIONS[id];
}

/**
 * Get all potions
 */
export function getAllPotions(): PotionTemplate[] {
  return Object.values(ALL_POTIONS);
}

/**
 * Get potions by category
 */
export function getPotionsByCategory(category: PotionCategory): PotionTemplate[] {
  return getAllPotions().filter(p => p.category === category);
}

/**
 * Get potions by rarity
 */
export function getPotionsByRarity(rarity: PotionRarity): PotionTemplate[] {
  return getAllPotions().filter(p => p.rarity === rarity);
}

/**
 * Get potions by source
 */
export function getPotionsBySource(source: PotionSource): PotionTemplate[] {
  return getAllPotions().filter(p => p.sources.includes(source));
}

/**
 * Get potions by minimum level
 */
export function getPotionsByMinLevel(level: number): PotionTemplate[] {
  return getAllPotions().filter(p => (p.requiredLevel || 0) >= level);
}

/**
 * Get all craftable potions
 */
export function getCraftablePotions(): PotionTemplate[] {
  return getPotionsBySource(PotionSource.CRAFTING);
}

/**
 * Get all purchasable potions
 */
export function getShopPotions(): PotionTemplate[] {
  return getPotionsBySource(PotionSource.SHOP);
}

/**
 * Get all boss drop potions
 */
export function getBossDropPotions(): PotionTemplate[] {
  return getPotionsBySource(PotionSource.BOSS_DROP);
}

/**
 * Get all legendary potions
 */
export function getLegendaryPotions(): PotionTemplate[] {
  return getPotionsByRarity(PotionRarity.LEGENDARY);
}

/**
 * Get all epic potions
 */
export function getEpicPotions(): PotionTemplate[] {
  return getPotionsByRarity(PotionRarity.EPIC);
}

/**
 * Get all potion IDs
 */
export function getAllPotionIds(): string[] {
  return Object.keys(ALL_POTIONS);
}

// ========== STATISTICS ==========

export const potionStats = {
  totalPotions: Object.keys(ALL_POTIONS).length,
  byCategory: {
    [PotionCategory.HEALTH]: getPotionsByCategory(PotionCategory.HEALTH).length,
    [PotionCategory.MANA]: getPotionsByCategory(PotionCategory.MANA).length,
    [PotionCategory.BUFF]: getPotionsByCategory(PotionCategory.BUFF).length,
    [PotionCategory.CURE]: getPotionsByCategory(PotionCategory.CURE).length,
    [PotionCategory.RESISTANCE]: getPotionsByCategory(PotionCategory.RESISTANCE).length,
    [PotionCategory.SPECIAL]: getPotionsByCategory(PotionCategory.SPECIAL).length,
  },
  byRarity: {
    [PotionRarity.COMMON]: getPotionsByRarity(PotionRarity.COMMON).length,
    [PotionRarity.UNCOMMON]: getPotionsByRarity(PotionRarity.UNCOMMON).length,
    [PotionRarity.RARE]: getPotionsByRarity(PotionRarity.RARE).length,
    [PotionRarity.EPIC]: getPotionsByRarity(PotionRarity.EPIC).length,
    [PotionRarity.LEGENDARY]: getPotionsByRarity(PotionRarity.LEGENDARY).length,
  },
  craftable: getCraftablePotions().length,
  shopAvailable: getShopPotions().length,
  bossDrop: getBossDropPotions().length,
};
