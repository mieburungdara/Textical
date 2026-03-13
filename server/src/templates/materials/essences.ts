/**
 * Essence Materials
 * 
 * Elemental essences, magic crystals, and mystical substances.
 * Used for high-level crafting, enchanting, and magic item creation.
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

// ========== TIER 1 - COMMON ESSENCES ==========

export const MAGIC_DUST = createMaterialTemplate(
  'magic_dust',
  'Magic Dust',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.MOB_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 5,
    description: 'Fine dust infused with trace amounts of magic.',
  }
);

export const LESSER_CRYSTAL = createMaterialTemplate(
  'lesser_crystal',
  'Lesser Crystal',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_1,
    rarity: MaterialRarity.COMMON,
    sources: [MaterialSource.GATHERING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.SELLING],
    value: 8,
    description: 'A small crystal with faint magical energy.',
  }
);

// ========== TIER 2 - UNCOMMON ESSENCES ==========

export const FIRE_ESSENCE = createMaterialTemplate(
  'fire_essence',
  'Fire Essence',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.MOB_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 25,
    description: 'A vial of liquid fire. Warm to the touch.',
  }
);

export const WATER_ESSENCE = createMaterialTemplate(
  'water_essence',
  'Water Essence',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.FISHING, MaterialSource.MOB_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 25,
    description: 'Pure water infused with magical properties.',
  }
);

export const EARTH_ESSENCE = createMaterialTemplate(
  'earth_essence',
  'Earth Essence',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.GATHERING, MaterialSource.MOB_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 25,
    description: 'Compressed earth energy. Solid yet warm.',
  }
);

export const WIND_ESSENCE = createMaterialTemplate(
  'wind_essence',
  'Wind Essence',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.MOB_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 25,
    description: 'Swirling air captured in a vial. Hard to contain.',
  }
);

export const MYSTIC_CRYSTAL = createMaterialTemplate(
  'mystic_crystal',
  'Mystic Crystal',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_2,
    rarity: MaterialRarity.UNCOMMON,
    sources: [MaterialSource.GATHERING, MaterialSource.MOB_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 30,
    description: 'A crystal pulsing with arcane energy.',
  }
);

// ========== TIER 3 - RARE ESSENCES ==========

export const MAGIC_CRYSTAL = createMaterialTemplate(
  'magic_crystal',
  'Magic Crystal',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MOB_DROP, MaterialSource.BOSS_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.SELLING],
    value: 75,
    description: 'A concentrated crystal of pure magic.',
    requiredLevel: 25,
  }
);

export const HOLY_ESSENCE = createMaterialTemplate(
  'holy_essence',
  'Holy Essence',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.BOSS_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 100,
    description: 'Blessed light captured in crystalline form.',
    requiredLevel: 30,
  }
);

export const DARK_ESSENCE = createMaterialTemplate(
  'dark_essence',
  'Dark Essence',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.BOSS_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 100,
    description: 'Shadow condensed into a usable form. Cold and hungry.',
    requiredLevel: 30,
  }
);

export const THUNDER_ESSENCE = createMaterialTemplate(
  'thunder_essence',
  'Thunder Essence',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.MOB_DROP, MaterialSource.BOSS_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 90,
    description: 'Crackling lightning captured in crystalline form.',
    requiredLevel: 28,
  }
);

export const ICE_CRYSTAL = createMaterialTemplate(
  'ice_crystal',
  'Ice Crystal',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_3,
    rarity: MaterialRarity.RARE,
    sources: [MaterialSource.GATHERING, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT],
    value: 80,
    description: 'A crystal of eternal winter. Never melts.',
    requiredLevel: 28,
  }
);

// ========== TIER 4 - EPIC ESSENCES ==========

export const ARCANE_CRYSTAL = createMaterialTemplate(
  'arcane_crystal',
  'Arcane Crystal',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP, MaterialSource.RAID_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 300,
    description: 'A powerful crystal of raw arcane energy.',
    requiredLevel: 45,
  }
);

export const BLOOD_CRYSTAL = createMaterialTemplate(
  'blood_crystal',
  'Blood Crystal',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.POTION_INGREDIENT, MaterialUse.CLASS_REQUIREMENT],
    value: 350,
    description: 'A crystal formed from crystallized blood. Pulses with life.',
    requiredLevel: 50,
  }
);

export const ETHER_CRYSTAL = createMaterialTemplate(
  'ether_crystal',
  'Ether Crystal',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.RAID_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 400,
    description: 'A crystal from the ethereal plane. Nearly weightless.',
    requiredLevel: 52,
  }
);

export const SHADOW_CRYSTAL = createMaterialTemplate(
  'shadow_crystal',
  'Shadow Crystal',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_4,
    rarity: MaterialRarity.EPIC,
    sources: [MaterialSource.BOSS_DROP, MaterialSource.REFINE],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 380,
    description: 'A crystal of pure shadow. Absorbs surrounding light.',
    requiredLevel: 48,
  }
);

// ========== TIER 5 - LEGENDARY ESSENCES ==========

export const PRIMORDIAL_FIRE = createMaterialTemplate(
  'primordial_fire',
  'Primordial Fire',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 2000,
    description: 'Fire from the creation of the world. Burns without fuel.',
    requiredLevel: 70,
  }
);

export const PRIMORDIAL_ICE = createMaterialTemplate(
  'primordial_ice',
  'Primordial Ice',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 2000,
    description: 'Ice from the heart of the frozen void. Cold beyond comprehension.',
    requiredLevel: 70,
  }
);

export const SOUL_GEM = createMaterialTemplate(
  'soul_gem',
  'Soul Gem',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP, MaterialSource.BOSS_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT],
    value: 2500,
    description: 'A gem containing a captured soul. Faint whispers emanate from within.',
    requiredLevel: 75,
  }
);

export const CELESTIAL_CRYSTAL = createMaterialTemplate(
  'celestial_crystal',
  'Celestial Crystal',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_5,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT, MaterialUse.COLLECTION],
    value: 3000,
    description: 'A crystal forged from starlight itself. Brilliant and pure.',
    requiredLevel: 80,
  }
);

// ========== TIER 6 - MYTHICAL ESSENCES ==========

export const CREATION_SHARD = createMaterialTemplate(
  'creation_shard',
  'Creation Shard',
  MaterialCategory.ESSENCE,
  {
    tier: MaterialTier.TIER_6,
    rarity: MaterialRarity.LEGENDARY,
    sources: [MaterialSource.RAID_DROP, MaterialSource.EVENT],
    possibleUses: [MaterialUse.CRAFTING, MaterialUse.ENCHANTING, MaterialUse.CLASS_REQUIREMENT, MaterialUse.COLLECTION],
    value: 10000,
    description: 'A fragment of pure creation. Contains the power to reshape reality.',
    requiredLevel: 90,
  }
);

// ========== EXPORTS ==========

export const ESSENCE_MATERIALS = {
  // Tier 1
  magic_dust: MAGIC_DUST,
  lesser_crystal: LESSER_CRYSTAL,
  
  // Tier 2
  fire_essence: FIRE_ESSENCE,
  water_essence: WATER_ESSENCE,
  earth_essence: EARTH_ESSENCE,
  wind_essence: WIND_ESSENCE,
  mystic_crystal: MYSTIC_CRYSTAL,
  
  // Tier 3
  magic_crystal: MAGIC_CRYSTAL,
  holy_essence: HOLY_ESSENCE,
  dark_essence: DARK_ESSENCE,
  thunder_essence: THUNDER_ESSENCE,
  ice_crystal: ICE_CRYSTAL,
  
  // Tier 4
  arcane_crystal: ARCANE_CRYSTAL,
  blood_crystal: BLOOD_CRYSTAL,
  ether_crystal: ETHER_CRYSTAL,
  shadow_crystal: SHADOW_CRYSTAL,
  
  // Tier 5
  primordial_fire: PRIMORDIAL_FIRE,
  primordial_ice: PRIMORDIAL_ICE,
  soul_gem: SOUL_GEM,
  celestial_crystal: CELESTIAL_CRYSTAL,
  
  // Tier 6
  creation_shard: CREATION_SHARD,
};

export type EssenceMaterialId = keyof typeof ESSENCE_MATERIALS;
