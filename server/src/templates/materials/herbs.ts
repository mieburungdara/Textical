/**
 * Herb Materials
 * 
 * Herbs, mushrooms, and medicinal plants gathered from the wild.
 * Used for alchemy, cooking, and potion crafting.
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

// ========== TIER 1 - COMMON HERBS ==========

export const HEALING_HERB = createMaterialTemplate(
  'healing_herb',
  'Healing Herb',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.GATHERING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.POTION_INGREDIENT],
    value: 5,
    description: 'A common medicinal herb. Used in basic healing potions.',
  }
);

export const RED_MUSHROOM = createMaterialTemplate(
  'red_mushroom',
  'Red Mushroom',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.GATHERING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.FOOD_INGREDIENT],
    value: 3,
    description: 'A common red mushroom. Slightly toxic if eaten raw.',
  }
);

export const GREEN_MOSS = createMaterialTemplate(
  'green_moss',
  'Green Moss',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 2,
    description: 'A clump of green moss. Grows in damp places.',
  }
);

// ========== TIER 2 - UNCOMMON HERBS ==========

export const MOON_FLOWER = createMaterialTemplate(
  'moon_flower',
  'Moon Flower',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.POTION_INGREDIENT],
    value: 15,
    description: 'A pale flower that blooms at night. Absorbs lunar energy.',
  }
);

export const SUN_ROOT = createMaterialTemplate(
  'sun_root',
  'Sun Root',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.POTION_INGREDIENT],
    value: 18,
    description: 'A golden root that grows toward the sun. Warming properties.',
  }
);

export const BLUE_MUSHROOM = createMaterialTemplate(
  'blue_mushroom',
  'Blue Mushroom',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.GATHERING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.POTION_INGREDIENT],
    value: 20,
    description: 'A rare blue mushroom. Bioluminescent and magical.',
  }
);

export const WILD_GARLIC = createMaterialTemplate(
  'wild_garlic',
  'Wild Garlic',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.FOOD_INGREDIENT],
    value: 12,
    description: 'A pungent wild garlic. Repels undead and evil creatures.',
  }
);

// ========== TIER 3 - RARE HERBS ==========

export const SILVERLEAF = createMaterialTemplate(
  'silverleaf',
  'Silverleaf',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.GATHERING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 50,
    description: 'A shimmering silver leaf. Conducts magical energy.',
    requiredLevel: 25,
  }
);

export const GOLDEN_MUSHROOM = createMaterialTemplate(
  'golden_mushroom',
  'Golden Mushroom',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 75,
    description: 'A radiant golden mushroom. Said to bring fortune.',
    requiredLevel: 30,
  }
);

export const GHOST_MUSHROOM = createMaterialTemplate(
  'ghost_mushroom',
  'Ghost Mushroom',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.GATHERING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 60,
    description: 'A translucent mushroom. Partially incorporeal.',
    requiredLevel: 28,
  }
);

export const BLOODROOT = createMaterialTemplate(
  'bloodroot',
  'Bloodroot',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.POTION_INGREDIENT, MaterialUse.SELLING],
    value: 55,
    description: 'A red-rooted plant. Its sap has powerful healing properties.',
    requiredLevel: 25,
  }
);

// ========== TIER 4 - EPIC HERBS ==========

export const DRAGONSBANE = createMaterialTemplate(
  'dragonsbane',
  'Dragonsbane',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.GATHERING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 250,
    description: 'A fierce herb that grows where dragons sleep. Toxic to draconic beings.',
    requiredLevel: 45,
  }
);

export const WITCH_VINE = createMaterialTemplate(
  'witch_vine',
  'Witch Vine',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.GATHERING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 300,
    description: 'A twisted vine used by witches. Strong magical conduit.',
    requiredLevel: 50,
  }
);

export const FROSTBLOSSOM = createMaterialTemplate(
  'frostblossom',
  'Frostblossom',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.GATHERING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 350,
    description: 'A frozen flower that never melts. Extremely cold to the touch.',
    requiredLevel: 48,
  }
);

// ========== TIER 5 - LEGENDARY HERBS ==========

export const LOTUS_OF_DEATH = createMaterialTemplate(
  'lotus_of_death',
  'Lotus of Death',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.BOSS_DROP, MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 1500,
    description: 'A black lotus from the underworld. Summons deathly energies.',
    requiredLevel: 70,
  }
);

export const DRAGON_HEART_ROOT = createMaterialTemplate(
  'dragon_heart_root',
  'Dragon Heart Root',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT, MaterialUse.CLASS_REQUIREMENT],
    value: 2000,
    description: 'A root shaped like a dragon heart. Pulsates with elemental power.',
    requiredLevel: 75,
  }
);

// ========== TIER 6 - MYTHICAL HERBS ==========

export const ELDER_LOTUS = createMaterialTemplate(
  'elder_lotus',
  'Elder Lotus',
  MaterialCategory.HERB,
  {
    tier: MaterialTier.TIER_6,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP, MaterialSource.EVENT],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT, MaterialUse.COLLECTION],
    value: 5000,
    description: 'A primordial lotus from the dawn of time. Contains the essence of life itself.',
    requiredLevel: 90,
  }
);

// ========== EXPORTS ==========

export const HERB_MATERIALS = {
  // Tier 1
  healing_herb: HEALING_HERB,
  red_mushroom: RED_MUSHROOM,
  green_moss: GREEN_MOSS,
  
  // Tier 2
  moon_flower: MOON_FLOWER,
  sun_root: SUN_ROOT,
  blue_mushroom: BLUE_MUSHROOM,
  wild_garlic: WILD_GARLIC,
  
  // Tier 3
  silverleaf: SILVERLEAF,
  golden_mushroom: GOLDEN_MUSHROOM,
  ghost_mushroom: GHOST_MUSHROOM,
  bloodroot: BLOODROOT,
  
  // Tier 4
  dragonsbane: DRAGONSBANE,
  witch_vine: WITCH_VINE,
  frostblossom: FROSTBLOSSOM,
  
  // Tier 5
  lotus_of_death: LOTUS_OF_DEATH,
  dragon_heart_root: DRAGON_HEART_ROOT,
  
  // Tier 6
  elder_lotus: ELDER_LOTUS,
};

export type HerbMaterialId = keyof typeof HERB_MATERIALS;
