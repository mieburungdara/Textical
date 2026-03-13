/**
 * Wood Materials
 * 
 * Wood obtained from trees or wooden monsters.
 * Used for woodworking, crafting, bows, staves.
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

// ========== TIER 1 - BASIC WOOD ==========

export const OAK_WOOD = createMaterialTemplate(
  'oak_wood',
  'Oak Wood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.WOODCUTTING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 3,
    description: 'A sturdy piece of oak wood. Common but reliable.',
  }
);

export const PINE_WOOD = createMaterialTemplate(
  'pine_wood',
  'Pine Wood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.WOODCUTTING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 2,
    description: 'Lightweight pine wood. Good for basic crafting.',
  }
);

// ========== TIER 2 - STANDARD WOOD ==========

export const ELDER_WOOD = createMaterialTemplate(
  'elder_wood',
  'Elder Wood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.WOODCUTTING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 15,
    description: 'A flexible yet strong wood. Prized for bows.',
  }
);

export const YEW_WOOD = createMaterialTemplate(
  'yew_wood',
  'Yew Wood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.WOODCUTTING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 20,
    description: 'Magical wood that enhances spell power.',
  }
);

// ========== TIER 3 - QUALITY WOOD ==========

export const REDWOOD = createMaterialTemplate(
  'redwood',
  'Redwood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.WOODCUTTING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 75,
    description: 'Deep red wood from ancient trees. Fire-resistant.',
  }
);

export const SPIRIT_WOOD = createMaterialTemplate(
  'spirit_wood',
  'Spirit Wood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.WOODCUTTING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.TRADING],
    value: 100,
    description: 'Ethereal wood that glows faintly. Excellent for magical items.',
  }
);

// ========== TIER 4 - RARE WOOD ==========

export const MOONWOOD = createMaterialTemplate(
  'moonwood',
  'Moonwood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.WOODCUTTING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 300,
    description: 'Wood that absorbs moonlight. Enhances lunar magic.',
  }
);

export const SUNWOOD = createMaterialTemplate(
  'sunwood',
  'Sunwood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.WOODCUTTING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 300,
    description: 'Wood that radiates warmth. Enhances solar magic.',
  }
);

// ========== TIER 5 - EPIC WOOD ==========

export const WORLD_TREE_WOOD = createMaterialTemplate(
  'world_tree_wood',
  'World Tree Wood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP, MaterialSource.EVENT],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 2000,
    description: 'Wood from the mythical World Tree. Contains ancient power.',
    requiredLevel: 80,
  }
);

export const DRAGON_BONE_WOOD = createMaterialTemplate(
  'dragon_bone_wood',
  'Dragon Bone Wood',
  MaterialCategory.WOOD,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.TRADING],
    value: 3000,
    description: 'Petrified dragon bone shaped like wood. Unimaginable durability.',
  }
);

// ========== EXPORTS ==========

export const WOOD_MATERIALS = {
  // Tier 1
  oak_wood: OAK_WOOD,
  pine_wood: PINE_WOOD,
  
  // Tier 2
  elder_wood: ELDER_WOOD,
  yew_wood: YEW_WOOD,
  
  // Tier 3
  redwood: REDWOOD,
  spirit_wood: SPIRIT_WOOD,
  
  // Tier 4
  moonwood: MOONWOOD,
  sunwood: SUNWOOD,
  
  // Tier 5
  world_tree_wood: WORLD_TREE_WOOD,
  dragon_bone_wood: DRAGON_BONE_WOOD,
};

export type WoodMaterialId = keyof typeof WOOD_MATERIALS;
