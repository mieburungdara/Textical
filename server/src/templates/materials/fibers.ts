/**
 * Fiber Materials
 * 
 * Fibers harvested from plants and creatures.
 * Used for tailoring, rope making, and crafting.
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

// ========== TIER 1 - COMMON FIBERS ==========

export const PLANT_FIBER = createMaterialTemplate(
  'plant_fiber',
  'Plant Fiber',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 2,
    description: 'Basic fiber from common plants. Used for rough cloth and rope.',
  }
);

export const COTTON = createMaterialTemplate(
  'cotton',
  'Cotton',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 5,
    description: 'Soft cotton fibers. Perfect for basic clothing.',
  }
);

export const WOOL = createMaterialTemplate(
  'wool',
  'Wool',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.SKINNING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 8,
    description: 'Coarse wool from sheep. Warm and durable.',
  }
);

// ========== TIER 2 - UNCOMMON FIBERS ==========

export const LINEN = createMaterialTemplate(
  'linen',
  'Linen',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 20,
    description: 'Refined linen fibers. Light and breathable.',
  }
);

export const FINE_WOOL = createMaterialTemplate(
  'fine_wool',
  'Fine Wool',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.SKINNING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 25,
    description: 'High-quality wool from mountain sheep. Extremely warm.',
  }
);

export const HEMP = createMaterialTemplate(
  'hemp',
  'Hemp',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 15,
    description: 'Strong hemp fibers. Used for durable rope and cloth.',
  }
);

export const SPIDER_SILK = createMaterialTemplate(
  'spider_silk',
  'Spider Silk',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 30,
    description: 'Silk from giant spiders. Incredibly strong and lightweight.',
  }
);

// ========== TIER 3 - RARE FIBERS ==========

export const SILK = createMaterialTemplate(
  'silk',
  'Silk',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MOB_DROP, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 75,
    description: 'Luxurious silk from silk worms. Smooth and elegant.',
    requiredLevel: 25,
  }
);

export const RAPTOR_FEATHER = createMaterialTemplate(
  'raptor_feather',
  'Raptor Feather',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 50,
    description: 'A feather from a giant raptor. Strong and aerodynamic.',
    requiredLevel: 20,
  }
);

export const GRIFFON_FEATHER = createMaterialTemplate(
  'griffon_feather',
  'Griffon Feather',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 100,
    description: 'A magnificent griffon feather. Symbol of nobility.',
    requiredLevel: 30,
  }
);

export const HARPY_FEATHER = createMaterialTemplate(
  'harpy_feather',
  'Harpy Feather',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 60,
    description: 'A harpy feather with a haunting hue. Mesmerizing sheen.',
    requiredLevel: 28,
  }
);

// ========== TIER 4 - EPIC FIBERS ==========

export const DREAM_SILK = createMaterialTemplate(
  'dream_silk',
  'Dream Silk',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 300,
    description: 'Silk woven from dream energy. Shimmers with ethereal light.',
    requiredLevel: 45,
  }
);

export const ABYSSAL_SILK = createMaterialTemplate(
  'abyssal_silk',
  'Abyssal Silk',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 350,
    description: 'Dark silk from the abyss. Absorbs light and radiates cold.',
    requiredLevel: 50,
  }
);

export const THUNDERBIRD_FEATHER = createMaterialTemplate(
  'thunderbird_feather',
  'Thunderbird Feather',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 400,
    description: 'A feather from a thunderbird. Crackles with electricity.',
    requiredLevel: 52,
  }
);

export const GARGOYLE_SCALE = createMaterialTemplate(
  'gargoyle_scale',
  'Gargoyle Scale',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 280,
    description: 'A stone-like scale from a gargoyle. Rigid yet workable.',
    requiredLevel: 45,
  }
);

// ========== TIER 5 - LEGENDARY FIBERS ==========

export const PHOENIX_SILK = createMaterialTemplate(
  'phoenix_silk',
  'Phoenix Silk',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 2000,
    description: 'Silk woven from phoenix feathers. Warm and eternally burning.',
    requiredLevel: 70,
  }
);

export const STELLAR_THREAD = createMaterialTemplate(
  'stellar_thread',
  'Stellar Thread',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 2500,
    description: 'Thread spun from starlight. Gleams with cosmic power.',
    requiredLevel: 75,
  }
);

export const CELESTIAL_SILK = createMaterialTemplate(
  'celestial_silk',
  'Celestial Silk',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT, MaterialUse.COLLECTION],
    value: 3000,
    description: 'Divine silk from the heavens. Weightless and radiant.',
    requiredLevel: 80,
  }
);

// ========== TIER 6 - MYTHICAL FIBERS ==========

export const FATE_THREAD = createMaterialTemplate(
  'fate_thread',
  'Fate Thread',
  MaterialCategory.FIBER,
  {
    tier: MaterialTier.TIER_6,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP, MaterialSource.EVENT],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT, MaterialUse.COLLECTION],
    value: 8000,
    description: 'A thread that binds fate itself. Those who possess it shape destiny.',
    requiredLevel: 90,
  }
);

// ========== EXPORTS ==========

export const FIBER_MATERIALS = {
  // Tier 1
  plant_fiber: PLANT_FIBER,
  cotton: COTTON,
  wool: WOOL,
  
  // Tier 2
  linen: LINEN,
  fine_wool: FINE_WOOL,
  hemp: HEMP,
  spider_silk: SPIDER_SILK,
  
  // Tier 3
  silk: SILK,
  raptor_feather: RAPTOR_FEATHER,
  griffon_feather: GRIFFON_FEATHER,
  harpy_feather: HARPY_FEATHER,
  
  // Tier 4
  dream_silk: DREAM_SILK,
  abyssal_silk: ABYSSAL_SILK,
  thunderbird_feather: THUNDERBIRD_FEATHER,
  gargoyle_scale: GARGOYLE_SCALE,
  
  // Tier 5
  phoenix_silk: PHOENIX_SILK,
  stellar_thread: STELLAR_THREAD,
  celestial_silk: CELESTIAL_SILK,
  
  // Tier 6
  fate_thread: FATE_THREAD,
};

export type FiberMaterialId = keyof typeof FIBER_MATERIALS;
