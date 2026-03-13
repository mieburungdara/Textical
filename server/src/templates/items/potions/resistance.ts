/**
 * Resistance Potions
 * 
 * Potions that provide elemental and status immunity.
 * Essential for fighting specific element enemies.
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
  createPotionTemplate
} from './PotionTemplate.js';

// ========== FIRE RESISTANCE ==========

export const FIRE_RESISTANCE = createPotionTemplate(
  'fire_resistance',
  'Fire Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.FIRE_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_FIRE,
      value: 30,
      duration: 300,
      description: '+30% Fire Resistance for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 10,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 40,
    recipe: {
      ingredients: [
        { materialId: 'ice_crystal', quantity: 1 },
        { materialId: 'blue_mushroom', quantity: 1 },
      ],
    },
  }
);

export const GREATER_FIRE_RESISTANCE = createPotionTemplate(
  'greater_fire_resistance',
  'Greater Fire Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.FIRE_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_FIRE,
      value: 60,
      duration: 400,
      description: '+60% Fire Resistance for 400 ticks',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 20,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.BOSS_DROP],
    value: 100,
    recipe: {
      ingredients: [
        { materialId: 'ice_crystal', quantity: 2 },
        { materialId: 'primordial_ice', quantity: 1 },
      ],
    },
  }
);

// ========== ICE RESISTANCE ==========

export const ICE_RESISTANCE = createPotionTemplate(
  'ice_resistance',
  'Ice Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.ICE_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_ICE,
      value: 30,
      duration: 300,
      description: '+30% Ice Resistance for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 10,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 40,
    recipe: {
      ingredients: [
        { materialId: 'fire_essence', quantity: 1 },
        { materialId: 'red_mushroom', quantity: 1 },
      ],
    },
  }
);

export const GREATER_ICE_RESISTANCE = createPotionTemplate(
  'greater_ice_resistance',
  'Greater Ice Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.ICE_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_ICE,
      value: 60,
      duration: 400,
      description: '+60% Ice Resistance for 400 ticks',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 20,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.BOSS_DROP],
    value: 100,
    recipe: {
      ingredients: [
        { materialId: 'fire_essence', quantity: 2 },
        { materialId: 'primordial_fire', quantity: 1 },
      ],
    },
  }
);

// ========== LIGHTNING RESISTANCE ==========

export const LIGHTNING_RESISTANCE = createPotionTemplate(
  'lightning_resistance',
  'Lightning Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.LIGHTNING_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_LIGHTNING,
      value: 30,
      duration: 300,
      description: '+30% Lightning Resistance for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 10,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 40,
    recipe: {
      ingredients: [
        { materialId: 'earth_essence', quantity: 1 },
        { materialId: 'iron_ore', quantity: 1 },
      ],
    },
  }
);

export const GREATER_LIGHTNING_RESISTANCE = createPotionTemplate(
  'greater_lightning_resistance',
  'Greater Lightning Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.LIGHTNING_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_LIGHTNING,
      value: 60,
      duration: 400,
      description: '+60% Lightning Resistance for 400 ticks',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 20,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.BOSS_DROP],
    value: 100,
    recipe: {
      ingredients: [
        { materialId: 'earth_essence', quantity: 2 },
        { materialId: 'thunder_essence', quantity: 2 },
      ],
    },
  }
);

// ========== DARKNESS RESISTANCE ==========

export const DARKNESS_RESISTANCE = createPotionTemplate(
  'darkness_resistance',
  'Darkness Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.DARKNESS_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_DARKNESS,
      value: 30,
      duration: 300,
      description: '+30% Darkness Resistance for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 15,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 50,
    recipe: {
      ingredients: [
        { materialId: 'holy_essence', quantity: 1 },
        { materialId: 'silverleaf', quantity: 1 },
      ],
    },
  }
);

export const GREATER_DARKNESS_RESISTANCE = createPotionTemplate(
  'greater_darkness_resistance',
  'Greater Darkness Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.DARKNESS_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_DARKNESS,
      value: 60,
      duration: 400,
      description: '+60% Darkness Resistance for 400 ticks',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 25,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 120,
    recipe: {
      ingredients: [
        { materialId: 'holy_essence', quantity: 2 },
        { materialId: 'celestial_crystal', quantity: 1 },
      ],
    },
  }
);

// ========== HOLY RESISTANCE ==========

export const HOLY_RESISTANCE = createPotionTemplate(
  'holy_resistance',
  'Holy Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.HOLY_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_HOLY,
      value: 30,
      duration: 300,
      description: '+30% Holy Resistance for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 15,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 50,
    recipe: {
      ingredients: [
        { materialId: 'dark_essence', quantity: 1 },
        { materialId: 'ghost_mushroom', quantity: 1 },
      ],
    },
  }
);

export const GREATER_HOLY_RESISTANCE = createPotionTemplate(
  'greater_holy_resistance',
  'Greater Holy Resistance Potion',
  PotionCategory.RESISTANCE,
  PotionType.HOLY_RESISTANCE,
  [
    {
      type: PotionEffectType.RESIST_HOLY,
      value: 60,
      duration: 400,
      description: '+60% Holy Resistance for 400 ticks',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 25,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 120,
    recipe: {
      ingredients: [
        { materialId: 'dark_essence', quantity: 2 },
        { materialId: 'shadow_crystal', quantity: 1 },
      ],
    },
  }
);

// ========== ELEMENTAL AEGIS ==========

export const ELEMENTAL_AEGIS = createPotionTemplate(
  'elemental_aegis',
  'Elemental Aegis Potion',
  PotionCategory.RESISTANCE,
  PotionType.ELEMENTAL_AEGIS,
  [
    {
      type: PotionEffectType.RESIST_FIRE,
      value: 40,
      duration: 400,
      description: '+40% Fire Resistance for 400 ticks',
    },
    {
      type: PotionEffectType.RESIST_ICE,
      value: 40,
      duration: 400,
      description: '+40% Ice Resistance for 400 ticks',
    },
    {
      type: PotionEffectType.RESIST_LIGHTNING,
      value: 40,
      duration: 400,
      description: '+40% Lightning Resistance for 400 ticks',
    }
  ],
  {
    rarity: PotionRarity.EPIC,
    targetType: PotionTargetType.SELF,
    requiredLevel: 30,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 250,
    recipe: {
      ingredients: [
        { materialId: 'primordial_fire', quantity: 1 },
        { materialId: 'primordial_ice', quantity: 1 },
        { materialId: 'thunder_essence', quantity: 2 },
        { materialId: 'arcane_crystal', quantity: 2 },
      ],
    },
  }
);

// ========== STATUS IMMUNITY POTIONS ==========

export const ANTIPOISON = createPotionTemplate(
  'antipoison',
  'Antipoison Potion',
  PotionCategory.RESISTANCE,
  PotionType.ANTIPOISON,
  [
    {
      type: PotionEffectType.IMMUNE_POISON,
      value: 1,
      duration: 300,
      description: 'Grants Poison Immunity for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 15,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 60,
    recipe: {
      ingredients: [
        { materialId: 'wild_garlic', quantity: 3 },
        { materialId: 'silverleaf', quantity: 1 },
      ],
    },
  }
);

export const ANTISTUN = createPotionTemplate(
  'antistun',
  'Antistun Potion',
  PotionCategory.RESISTANCE,
  PotionType.ANTISTUN,
  [
    {
      type: PotionEffectType.IMMUNE_STUN,
      value: 1,
      duration: 300,
      description: 'Grants Stun Immunity for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 15,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 60,
    recipe: {
      ingredients: [
        { materialId: 'sun_root', quantity: 2 },
        { materialId: 'wind_essence', quantity: 2 },
      ],
    },
  }
);

export const ANTI_CURSE = createPotionTemplate(
  'anti_curse',
  'Anti-Curse Potion',
  PotionCategory.RESISTANCE,
  PotionType.ANTI_CURSE,
  [
    {
      type: PotionEffectType.IMMUNE_CURSE,
      value: 1,
      duration: 300,
      description: 'Grants Curse Immunity for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 20,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 100,
    recipe: {
      ingredients: [
        { materialId: 'holy_essence', quantity: 2 },
        { materialId: 'silverleaf', quantity: 2 },
        { materialId: 'mystic_crystal', quantity: 1 },
      ],
    },
  }
);

export const STATUS_SHIELD = createPotionTemplate(
  'status_shield',
  'Status Shield Potion',
  PotionCategory.RESISTANCE,
  PotionType.STATUS_SHIELD,
  [
    {
      type: PotionEffectType.IMMUNE_ALL,
      value: 1,
      duration: 300,
      description: 'Grants Immunity to all status effects for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.LEGENDARY,
    targetType: PotionTargetType.SELF,
    requiredLevel: 40,
    sources: [PotionSource.BOSS_DROP, PotionSource.QUEST_REWARD, PotionSource.EVENT],
    value: 500,
    recipe: {
      ingredients: [
        { materialId: 'elder_lotus', quantity: 1 },
        { materialId: 'celestial_crystal', quantity: 2 },
        { materialId: 'soul_gem', quantity: 1 },
      ],
    },
  }
);

// ========== EXPORTS ==========

export const RESISTANCE_POTIONS = {
  // Fire
  fire_resistance: FIRE_RESISTANCE,
  greater_fire_resistance: GREATER_FIRE_RESISTANCE,
  
  // Ice
  ice_resistance: ICE_RESISTANCE,
  greater_ice_resistance: GREATER_ICE_RESISTANCE,
  
  // Lightning
  lightning_resistance: LIGHTNING_RESISTANCE,
  greater_lightning_resistance: GREATER_LIGHTNING_RESISTANCE,
  
  // Darkness
  darkness_resistance: DARKNESS_RESISTANCE,
  greater_darkness_resistance: GREATER_DARKNESS_RESISTANCE,
  
  // Holy
  holy_resistance: HOLY_RESISTANCE,
  greater_holy_resistance: GREATER_HOLY_RESISTANCE,
  
  // Combo
  elemental_aegis: ELEMENTAL_AEGIS,
  
  // Status Immunity
  antipoison: ANTIPOISON,
  antistun: ANTISTUN,
  anti_curse: ANTI_CURSE,
  status_shield: STATUS_SHIELD,
};

export type ResistancePotionId = keyof typeof RESISTANCE_POTIONS;
