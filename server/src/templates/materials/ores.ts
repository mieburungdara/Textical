/**
 * Ore Materials
 * 
 * Ores mined from deposits or obtained from monsters.
 * Used for metalworking, blacksmithing, crafting.
 */

import { 
  MaterialTemplate, 
  MaterialCategory, 
  MaterialTier, 
  MaterialRarity, 
  MaterialSource,
  MaterialUse,
  createMaterialTemplate 
} from './MaterialTemplate.js';

// ========== TIER 1 - BASIC ORES ==========

export const IRON_ORE = createMaterialTemplate(
  'iron_ore',
  'Iron Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.MINING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 5,
    description: 'A chunk of raw iron ore. Can be smelted into iron ingots.',
  }
);

export const COAL = createMaterialTemplate(
  'coal',
  'Coal',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.MINING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 3,
    description: 'A piece of coal. Used as fuel for smelting.',
  }
);

// ========== TIER 2 - STANDARD ORES ==========

export const COPPER_ORE = createMaterialTemplate(
  'copper_ore',
  'Copper Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.MINING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 10,
    description: 'A chunk of copper ore. Used for bronze alloy.',
  }
);

export const SILVER_ORE = createMaterialTemplate(
  'silver_ore',
  'Silver Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.MINING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 25,
    description: 'A chunk of silver ore. Prized by craftsmen.',
  }
);

// ========== TIER 3 - QUALITY ORES ==========

export const GOLD_ORE = createMaterialTemplate(
  'gold_ore',
  'Gold Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MINING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 100,
    description: 'A chunk of golden ore. Highly valuable and malleable.',
  }
);

export const MYTHRIL_ORE = createMaterialTemplate(
  'mythril_ore',
  'Mythril Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MINING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 250,
    description: 'A rare silvery ore. Lightweight yet incredibly strong.',
  }
);

// ========== TIER 4 - RARE ORES ==========

export const ADAMANTITE_ORE = createMaterialTemplate(
  'adamantite_ore',
  'Adamantite Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.MINING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 500,
    description: 'An incredibly hard ore. Used for legendary weapons.',
  }
);

export const RUBY_ORE = createMaterialTemplate(
  'ruby_ore',
  'Ruby Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.MINING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 750,
    description: 'A deep red ore containing rubies. Magical properties.',
  }
);

export const SAPPHIRE_ORE = createMaterialTemplate(
  'sapphire_ore',
  'Sapphire Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.MINING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 750,
    description: 'A blue ore containing sapphires. Radiates cold energy.',
  }
);

// ========== TIER 5 - EPIC ORES ==========

export const DIAMOND_ORE = createMaterialTemplate(
  'diamond_ore',
  'Diamond Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.MINING, MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.TRADING],
    value: 2000,
    description: 'The hardest natural material. Sparkles with inner light.',
  }
);

export const ETHERIUM_ORE = createMaterialTemplate(
  'etherium_ore',
  'Etherium Ore',
  MaterialCategory.ORE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 5000,
    description: 'A mythical ore from another dimension. Pulsates with power.',
    requiredLevel: 80,
  }
);

// ========== EXPORTS ==========

export const ORE_MATERIALS = {
  // Tier 1
  iron_ore: IRON_ORE,
  coal: COAL,
  
  // Tier 2
  copper_ore: COPPER_ORE,
  silver_ore: SILVER_ORE,
  
  // Tier 3
  gold_ore: GOLD_ORE,
  mythril_ore: MYTHRIL_ORE,
  
  // Tier 4
  adamantite_ore: ADAMANTITE_ORE,
  ruby_ore: RUBY_ORE,
  sapphire_ore: SAPPHIRE_ORE,
  
  // Tier 5
  diamond_ore: DIAMOND_ORE,
  etherium_ore: ETHERIUM_ORE,
};

export type OreMaterialId = keyof typeof ORE_MATERIALS;
