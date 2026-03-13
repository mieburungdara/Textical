/**
 * Material Template System
 * 
 * Defines materials used for crafting, quests, class requirements, etc.
 * Materials are items that can be gathered, traded, or used in recipes.
 */

import { Unit } from '../../combat/TickCost.js';

// ========== MATERIAL CATEGORY ==========

export enum MaterialCategory {
  // Raw Materials
  ORE = 'ore',           // Iron ore, gold ore, mithril, etc.
  WOOD = 'wood',         // Oak, pine, elder, etc.
  HIDE = 'hide',         // Leather, scales, fur, etc.
  HERB = 'herb',         // Medicinal plants, mushrooms
  FIBER = 'fiber',       // Cotton, silk, spider silk
  BONE = 'bone',         // Bones, claws, teeth
  ESSENCE = 'essence',   // Elemental essences, magic crystals
  
  // Refined Materials
  METAL = 'metal',       // Iron ingot, steel, mithril ingot
  GEM = 'gem',           // Ruby, sapphire, diamond
  CLOTH = 'cloth',       // Silk cloth, magic cloth
  
  // Consumables
  POTION_INGREDIENT = 'potion_ingredient', // Alchemy ingredients
  FOOD_INGREDIENT = 'food_ingredient',     // Cooking ingredients
  
  // Special
  TREASURE = 'treasure', // Rare items, quest items
  CURRENCY = 'currency', // Gold, gems (trade currency)
}

// ========== MATERIAL RARITY ==========

export enum MaterialRarity {
  COMMON = 'common',       // Easy to find (50%+ drop rate)
  UNCOMMON = 'uncommon',   // Moderate (10-30%)
  RARE = 'rare',           // Hard to find (1-10%)
  EPIC = 'epic',           // Very rare (0.1-1%)
  LEGENDARY = 'legendary',  // Extremely rare (<0.1%)
}

// ========== MATERIAL TIER ==========

export enum MaterialTier {
  TIER_1 = 1,  // Basic (levels 1-20)
  TIER_2 = 2,  // Standard (levels 21-40)
  TIER_3 = 3,  // Quality (levels 41-60)
  TIER_4 = 4,  // Rare (levels 61-80)
  TIER_5 = 5,  // Epic (levels 81-100)
  TIER_6 = 6,  // Legendary (levels 101+)
}

// ========== MATERIAL SOURCE ==========

export enum MaterialSource {
  // Gathering
  MINING = 'mining',       // From ore deposits
  WOODCUTTING = 'woodcutting', // From trees
  GATHERING = 'gathering', // Herbs, mushrooms
  SKINNING = 'skinning',   // From beasts
  FISHING = 'fishing',     // From water
  
  // Monster Drops
  MOB_DROP = 'mob_drop',   // From killing monsters
  BOSS_DROP = 'boss_drop', // From bosses
  RAID_DROP = 'raid_drop', // From raid bosses
  
  // Crafting
  REFINE = 'refine',       // Refined from raw materials
  SYNTHESIS = 'synthesis', // Created via crafting
  
  // Quest
  QUEST_REWARD = 'quest_reward',
  QUEST_ITEM = 'quest_item', // Quest-specific items
  
  // Trade
  SHOP = 'shop',           // Can be bought
  TRADE = 'trade',         // Can be traded
  
  // Special
  EVENT = 'event',        // Event-exclusive
  DAILY = 'daily',        // Daily login/reward
}

// ========== MATERIAL USE ==========

export enum MaterialUse {
  CRAFTING = 'crafting',     // Used in crafting recipes
  QUEST = 'quest',           // Used in quests
  CLASS_REQUIREMENT = 'class_requirement', // Required for class advancement
  ENCHANTING = 'enchanting', // Used for enchanting
  SELLING = 'selling',       // Can be sold for gold
  TRADING = 'trading',      // Can be traded
  COLLECTION = 'collection', // Collection/achievement
  POTION_INGREDIENT = 'potion_ingredient', // Used in potion brewing
  FOOD_INGREDIENT = 'food_ingredient',     // Used in cooking
}

// ========== MATERIAL TEMPLATE ==========

export interface MaterialTemplate {
  id: string;
  name: string;
  description: string;
  
  // Categorization
  category: MaterialCategory;
  tier: MaterialTier;
  rarity: MaterialRarity;
  
  // Sources
  sources: MaterialSource[];
  possibleUses: MaterialUse[];
  
  // Stats (if applicable)
  value?: number;           // Gold value when selling
  stackSize?: number;        // Max stack size (default: 99)
  
  // Effects (for consumable materials)
  effects?: MaterialEffect[];
  
  // Requirements
  requiredLevel?: number;    // Minimum level to use
  requiredClass?: string[];  // Required classes
  
  // Quest/Collection
  questId?: string;         // Associated quest
  collectionId?: string;     // Associated collection
  
  // Visual
  icon?: string;
  sprite?: string;
}

// ========== MATERIAL EFFECT ==========

export interface MaterialEffect {
  type: string;
  value: number;
  duration?: number;
  description: string;
}

// ========== MATERIAL REGISTRY ==========

export interface MaterialRegistry {
  materials: Map<string, MaterialTemplate>;
  getMaterial(id: string): MaterialTemplate | undefined;
  getMaterialsByCategory(category: MaterialCategory): MaterialTemplate[];
  getMaterialsByRarity(rarity: MaterialRarity): MaterialTemplate[];
  getMaterialsByTier(tier: MaterialTier): MaterialTemplate[];
  getMaterialsBySource(source: MaterialSource): MaterialTemplate[];
  getMaterialsByUse(use: MaterialUse): MaterialTemplate[];
}

// ========== HELPER FUNCTIONS ==========

/**
 * Create a material template
 */
export function createMaterialTemplate(
  id: string,
  name: string,
  category: MaterialCategory,
  options: Partial<MaterialTemplate> = {}
): MaterialTemplate {
  return {
    id,
    name,
    description: options.description || `${name} material`,
    category,
    tier: options.tier || MaterialTier.TIER_1,
    rarity: options.rarity || MaterialRarity.COMMON,
    sources: options.sources || [MaterialSource.MOB_DROP],
    possibleUses: options.possibleUses || [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: options.value || 1,
    stackSize: options.stackSize || 99,
    ...options,
  };
}

/**
 * Get rarity color (for UI)
 */
export function getMaterialRarityColor(rarity: MaterialRarity): string {
  const colors: Record<MaterialRarity, string> = {
    [MaterialRarity.COMMON]: '#9d9d9d',    // Gray
    [MaterialRarity.UNCOMMON]: '#1eff00', // Green
    [MaterialRarity.RARE]: '#0070dd',      // Blue
    [MaterialRarity.EPIC]: '#a335ee',     // Purple
    [MaterialRarity.LEGENDARY]: '#ff8000', // Orange
  };
  return colors[rarity];
}

/**
 * Get rarity multiplier for drop rate
 */
export function getRarityMultiplier(rarity: MaterialRarity): number {
  const multipliers: Record<MaterialRarity, number> = {
    [MaterialRarity.COMMON]: 1.0,
    [MaterialRarity.UNCOMMON]: 0.3,
    [MaterialRarity.RARE]: 0.1,
    [MaterialRarity.EPIC]: 0.01,
    [MaterialRarity.LEGENDARY]: 0.001,
  };
  return multipliers[rarity];
}
