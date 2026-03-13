/**
 * Bone Materials
 * 
 * Bones, claws, teeth, and other skeletal parts from creatures.
 * Used for crafting, alchemy, and necromantic rituals.
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

// ========== TIER 1 - COMMON BONES ==========

export const SMALL_BONE = createMaterialTemplate(
  'small_bone',
  'Small Bone',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.MOB_DROP, MaterialSource.SKINNING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 2,
    description: 'A small bone from a minor creature. Useful for basic crafts.',
  }
);

export const ANIMAL_CLAW = createMaterialTemplate(
  'animal_claw',
  'Animal Claw',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.MOB_DROP, MaterialSource.SKINNING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 3,
    description: 'A sharp claw from a wild animal.',
  }
);

export const ANIMAL_TEETH = createMaterialTemplate(
  'animal_teeth',
  'Animal Teeth',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.MOB_DROP, MaterialSource.SKINNING],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 2,
    description: 'A set of sharp animal teeth. Can be used as weapons.',
  }
);

// ========== TIER 2 - UNCOMMON BONES ==========

export const WOLF_CLAW = createMaterialTemplate(
  'wolf_claw',
  'Wolf Claw',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.TRADING],
    value: 15,
    description: 'A sharp wolf claw. Symbol of pack strength.',
  }
);

export const SKELETON_BONE = createMaterialTemplate(
  'skeleton_bone',
  'Skeleton Bone',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING, MaterialUse.ENCHANTING],
    value: 20,
    description: 'A bone from an undead skeleton. Cold to the touch.',
  }
);

export const HARPY_CLAW = createMaterialTemplate(
  'harpy_claw',
  'Harpies Claw',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 18,
    description: 'A curved harpy claw. Incredibly sharp.',
  }
);

// ========== TIER 3 - RARE BONES ==========

export const OGRE_TOOTH = createMaterialTemplate(
  'ogre_tooth',
  'Ogre Tooth',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MOB_DROP, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 60,
    description: 'A massive ogre tooth. Can pierce through armor.',
    requiredLevel: 25,
  }
);

export const TROLL_BONE = createMaterialTemplate(
  'troll_bone',
  'Troll Bone',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MOB_DROP, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 75,
    description: 'A troll bone that regenerates slowly. Magical properties.',
    requiredLevel: 30,
  }
);

export const WIGHT_CRYSTAL = createMaterialTemplate(
  'wight_crystal',
  'Wight Crystal',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MOB_DROP, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 80,
    description: 'A crystallized piece of wight remains. Dark energy radiates from it.',
    requiredLevel: 28,
  }
);

export const MINOTAUR_HORN = createMaterialTemplate(
  'minotaur_horn',
  'Minotaur Horn',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 100,
    description: 'A massive minotaur horn. Symbol of the labyrinth guardian.',
    requiredLevel: 32,
  }
);

// ========== TIER 4 - EPIC BONES ==========

export const WYVERN_CLAW = createMaterialTemplate(
  'wyvern_claw',
  'Wyvern Claw',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 350,
    description: 'A massive wyvern claw. Deadly and highly prized.',
    requiredLevel: 45,
  }
);

export const DEMON_TEETH = createMaterialTemplate(
  'demon_teeth',
  'Demon Teeth',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 400,
    description: 'Fangs pulled from a demon. Smolder with infernal heat.',
    requiredLevel: 50,
  }
);

export const LICH_FINGER = createMaterialTemplate(
  'lich_finger',
  'Lich Finger',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 500,
    description: 'A finger bone from a powerful lich. Contains dark magic.',
    requiredLevel: 55,
  }
);

export const HYDRA_FANG = createMaterialTemplate(
  'hydra_fang',
  'Hydra Fang',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 450,
    description: 'A venomous hydra fang. Continues to drip with poison.',
    requiredLevel: 48,
  }
);

// ========== TIER 5 - LEGENDARY BONES ==========

export const DRAGON_CLAW = createMaterialTemplate(
  'dragon_claw',
  'Dragon Claw',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 2000,
    description: 'A massive claw from an ancient dragon. Can cut through anything.',
    requiredLevel: 70,
  }
);

export const DRAGON_TOOTH = createMaterialTemplate(
  'dragon_tooth',
  'Dragon Tooth',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT, MaterialUse.COLLECTION],
    value: 2500,
    description: 'A dragon tooth the size of a sword. Radiates pure power.',
    requiredLevel: 75,
  }
);

export const FENRIR_CLAW = createMaterialTemplate(
  'fenrir_claw',
  'Fenrir Claw',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 3000,
    description: 'A claw from the legendary wolf Fenrir. Gleams with starlight.',
    requiredLevel: 80,
  }
);

// ========== TIER 6 - MYTHICAL BONES ==========

export const LEVIATHAN_BONE = createMaterialTemplate(
  'leviathan_bone',
  'Leviathan Bone',
  MaterialCategory.BONE,
  {
    tier: MaterialTier.TIER_6,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP, MaterialSource.EVENT],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT, MaterialUse.COLLECTION],
    value: 8000,
    description: 'A bone from the primordial sea serpent. Contains the power of the abyss.',
    requiredLevel: 90,
  }
);

// ========== EXPORTS ==========

export const BONE_MATERIALS = {
  // Tier 1
  small_bone: SMALL_BONE,
  animal_claw: ANIMAL_CLAW,
  animal_teeth: ANIMAL_TEETH,
  
  // Tier 2
  wolf_claw: WOLF_CLAW,
  skeleton_bone: SKELETON_BONE,
  harpy_claw: HARPY_CLAW,
  
  // Tier 3
  ogre_tooth: OGRE_TOOTH,
  troll_bone: TROLL_BONE,
  wight_crystal: WIGHT_CRYSTAL,
  minotaur_horn: MINOTAUR_HORN,
  
  // Tier 4
  wyvern_claw: WYVERN_CLAW,
  demon_teeth: DEMON_TEETH,
  lich_finger: LICH_FINGER,
  hydra_fang: HYDRA_FANG,
  
  // Tier 5
  dragon_claw: DRAGON_CLAW,
  dragon_tooth: DRAGON_TOOTH,
  fenrir_claw: FENRIR_CLAW,
  
  // Tier 6
  leviathan_bone: LEVIATHAN_BONE,
};

export type BoneMaterialId = keyof typeof BONE_MATERIALS;
