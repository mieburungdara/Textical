/**
 * Hide Materials
 * 
 * Hides obtained from beasts through skinning or monster drops.
 * Used for leatherworking, armor crafting, and tailoring.
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

// ========== TIER 1 - BASIC HIDES ==========

export const RABBIT_HIDE = createMaterialTemplate(
  'rabbit_hide',
  'Rabbit Hide',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.SKINNING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 2,
    description: 'A small piece of rabbit hide. Soft and delicate.',
  }
);

export const LEATHER_SCrap = createMaterialTemplate(
  'leather_scrap',
  'Leather Scrap',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.SKINNING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 3,
    description: 'A small scrap of leather. Can be combined into larger pieces.',
  }
);

// ========== TIER 2 - STANDARD HIDES ==========

export const COW_HIDE = createMaterialTemplate(
  'cow_hide',
  'Cow Hide',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.SKINNING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 10,
    description: 'A sturdy cow hide. Perfect for basic leatherworking.',
  }
);

export const DEER_HIDE = createMaterialTemplate(
  'deer_hide',
  'Deer Hide',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.SKINNING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 20,
    description: 'A fine deer hide. Lightweight and flexible.',
  }
);

export const WOLF_HIDE = createMaterialTemplate(
  'wolf_hide',
  'Wolf Hide',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.SKINNING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 25,
    description: 'A thick wolf hide. Provides warmth and protection.',
  }
);

// ========== TIER 3 - QUALITY HIDES ==========

export const BEAR_HIDE = createMaterialTemplate(
  'bear_hide',
  'Bear Hide',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.SKINNING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 75,
    description: 'A massive bear hide. Incredibly durable and warm.',
  }
);

export const BOAR_HIDE = createMaterialTemplate(
  'boar_hide',
  'Boar Hide',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.SKINNING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 60,
    description: 'A tough boar hide. Resists piercing damage.',
  }
);

export const SERPENT_SCALE = createMaterialTemplate(
  'serpent_scale',
  'Serpent Scale',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.SKINNING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 80,
    description: 'A shimmering serpent scale. Naturally magical.',
  }
);

// ========== TIER 4 - RARE HIDES ==========

export const TIGER_HIDE = createMaterialTemplate(
  'tiger_hide',
  'Tiger Hide',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.SKINNING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.TRADING],
    value: 300,
    description: 'A majestic tiger hide. Striking patterns and exceptional durability.',
    requiredLevel: 40,
  }
);

export const DRAGON_SCALE = createMaterialTemplate(
  'dragon_scale',
  'Dragon Scale',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP, MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 500,
    description: 'A massive dragon scale. Nearly impenetrable and imbued with elemental power.',
    requiredLevel: 50,
  }
);

export const BASILISK_SCALE = createMaterialTemplate(
  'basilisk_scale',
  'Basilisk Scale',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 400,
    description: 'A petrifying basilisk scale. Handle with extreme caution.',
    requiredLevel: 45,
  }
);

// ========== TIER 5 - EPIC HIDES ==========

export const PHOENIX_FEATHER = createMaterialTemplate(
  'phoenix_feather',
  'Phoenix Feather',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 2500,
    description: 'A radiant phoenix feather. Warm to the touch and eternally burning.',
    requiredLevel: 70,
  }
);

export const ANCIENT_DRAGON_SCALE = createMaterialTemplate(
  'ancient_dragon_scale',
  'Ancient Dragon Scale',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT, MaterialUse.COLLECTION],
    value: 5000,
    description: 'A scale from an ancient dragon. Pulses with millennia of power.',
    requiredLevel: 80,
  }
);

// ========== TIER 6 - LEGENDARY HIDES ==========

export const DIVINE_HIDE = createMaterialTemplate(
  'divine_hide',
  'Divine Hide',
  MaterialCategory.HIDE,
  {
    tier: MaterialTier.TIER_6,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP, MaterialSource.EVENT],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT, MaterialUse.COLLECTION],
    value: 10000,
    description: 'A hide blessed by the gods themselves. Radiates holy energy.',
    requiredLevel: 90,
  }
);

// ========== EXPORTS ==========

export const HIDE_MATERIALS = {
  // Tier 1
  rabbit_hide: RABBIT_HIDE,
  leather_scrap: LEATHER_SCrap,
  
  // Tier 2
  cow_hide: COW_HIDE,
  deer_hide: DEER_HIDE,
  wolf_hide: WOLF_HIDE,
  
  // Tier 3
  bear_hide: BEAR_HIDE,
  boar_hide: BOAR_HIDE,
  serpent_scale: SERPENT_SCALE,
  
  // Tier 4
  tiger_hide: TIGER_HIDE,
  dragon_scale: DRAGON_SCALE,
  basilisk_scale: BASILISK_SCALE,
  
  // Tier 5
  phoenix_feather: PHOENIX_FEATHER,
  ancient_dragon_scale: ANCIENT_DRAGON_SCALE,
  
  // Tier 6
  divine_hide: DIVINE_HIDE,
};

export type HideMaterialId = keyof typeof HIDE_MATERIALS;
