/**
 * Cure Potions
 * 
 * Potions that remove negative status effects.
 * Essential for surviving dangerous encounters.
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

// ========== ANTIDOTE ==========

export const ANTIDOTE = createPotionTemplate(
  'antidote',
  'Antidote',
  PotionCategory.CURE,
  PotionType.ANTIDOTE,
  [
    {
      type: PotionEffectType.CURE_POISON,
      value: 1,
      description: 'Cures Poison status',
    }
  ],
  {
    rarity: PotionRarity.COMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 1,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 15,
    recipe: {
      ingredients: [
        { materialId: 'healing_herb', quantity: 1 },
        { materialId: 'wild_garlic', quantity: 1 },
      ],
    },
  }
);

// ========== CLEANSE ==========

export const CLEANSE = createPotionTemplate(
  'cleanse',
  'Cleanse Potion',
  PotionCategory.CURE,
  PotionType.CLEANSE,
  [
    {
      type: PotionEffectType.CURE_POISON,
      value: 1,
      description: 'Cures Poison',
    },
    {
      type: PotionEffectType.CURE_BLIND,
      value: 1,
      description: 'Cures Blind',
    },
    {
      type: PotionEffectType.CURE_SILENCE,
      value: 1,
      description: 'Cures Silence',
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
        { materialId: 'wild_garlic', quantity: 2 },
        { materialId: 'moon_flower', quantity: 1 },
        { materialId: 'water_essence', quantity: 1 },
      ],
    },
  }
);

// ========== AWAKEN ==========

export const AWAKEN = createPotionTemplate(
  'awaken',
  'Awaken Potion',
  PotionCategory.CURE,
  PotionType.AWAKEN,
  [
    {
      type: PotionEffectType.CURE_SLEEP,
      value: 1,
      description: 'Cures Sleep',
    },
    {
      type: PotionEffectType.CURE_STUN,
      value: 1,
      description: 'Cures Stun',
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
        { materialId: 'sun_root', quantity: 2 },
        { materialId: 'fire_essence', quantity: 1 },
      ],
    },
  }
);

// ========== STONESKIN ==========

export const STONESKIN = createPotionTemplate(
  'stoneskin',
  'Stoneskin Potion',
  PotionCategory.CURE,
  PotionType.STONESKIN,
  [
    {
      type: PotionEffectType.CURE_ROOT,
      value: 1,
      description: 'Cures Root',
    },
    {
      type: PotionEffectType.CURE_FREEZE,
      value: 1,
      description: 'Cures Freeze',
    },
    {
      type: PotionEffectType.BUFF_DEF,
      value: 20,
      duration: 200,
      description: '+20 Defense for 200 ticks',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 15,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.BOSS_DROP],
    value: 80,
    recipe: {
      ingredients: [
        { materialId: 'silverleaf', quantity: 2 },
        { materialId: 'earth_essence', quantity: 2 },
        { materialId: 'iron_ore', quantity: 2 },
      ],
    },
  }
);

// ========== FULL CURE ==========

export const FULL_CURE = createPotionTemplate(
  'full_cure',
  'Full Cure Potion',
  PotionCategory.CURE,
  PotionType.CLEANSE,
  [
    {
      type: PotionEffectType.CURE_ALL,
      value: 1,
      description: 'Cures all status effects',
    }
  ],
  {
    rarity: PotionRarity.EPIC,
    targetType: PotionTargetType.SELF,
    requiredLevel: 25,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP, PotionSource.QUEST_REWARD],
    value: 200,
    recipe: {
      ingredients: [
        { materialId: 'silverleaf', quantity: 3 },
        { materialId: 'golden_mushroom', quantity: 2 },
        { materialId: 'holy_essence', quantity: 2 },
        { materialId: 'celestial_crystal', quantity: 1 },
      ],
    },
  }
);

// ========== PARTY CURE ==========

export const PARTY_CURE = createPotionTemplate(
  'party_cure',
  'Party Cure Potion',
  PotionCategory.CURE,
  PotionType.CLEANSE,
  [
    {
      type: PotionEffectType.CURE_ALL,
      value: 1,
      description: 'Cures all status effects for all party members in range',
    }
  ],
  {
    rarity: PotionRarity.EPIC,
    targetType: PotionTargetType.AREA,
    range: 3,
    requiredLevel: 30,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 350,
    recipe: {
      ingredients: [
        { materialId: 'elder_lotus', quantity: 1 },
        { materialId: 'holy_essence', quantity: 3 },
        { materialId: 'celestial_crystal', quantity: 2 },
      ],
    },
  }
);

// ========== CURE POTIONS FOR SPECIFIC STATUS ==========

// Cures poison and gives temporary poison immunity
export const PURIFY = createPotionTemplate(
  'purify',
  'Purify Potion',
  PotionCategory.CURE,
  PotionType.ANTIDOTE,
  [
    {
      type: PotionEffectType.CURE_POISON,
      value: 1,
      description: 'Cures Poison',
    },
    {
      type: PotionEffectType.IMMUNE_POISON,
      value: 1,
      duration: 200,
      description: 'Grants Poison Immunity for 200 ticks',
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
        { materialId: 'bloodroot', quantity: 2 },
        { materialId: 'wild_garlic', quantity: 3 },
        { materialId: 'silverleaf', quantity: 1 },
      ],
    },
  }
);

// Cures stun and gives temporary stun immunity
export const RESOLVE = createPotionTemplate(
  'resolve',
  'Resolve Potion',
  PotionCategory.CURE,
  PotionType.AWAKEN,
  [
    {
      type: PotionEffectType.CURE_STUN,
      value: 1,
      description: 'Cures Stun',
    },
    {
      type: PotionEffectType.IMMUNE_STUN,
      value: 1,
      duration: 200,
      description: 'Grants Stun Immunity for 200 ticks',
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
        { materialId: 'sun_root', quantity: 2 },
        { materialId: 'thunder_essence', quantity: 2 },
        { materialId: 'wind_essence', quantity: 1 },
      ],
    },
  }
);

// ========== EXPORTS ==========

export const CURE_POTIONS = {
  // Basic cures
  antidote: ANTIDOTE,
  cleanse: CLEANSE,
  awaken: AWAKEN,
  stoneskin: STONESKIN,
  purify: PURIFY,
  resolve: RESOLVE,
  
  // Advanced cures
  full_cure: FULL_CURE,
  party_cure: PARTY_CURE,
};

export type CurePotionId = keyof typeof CURE_POTIONS;
