/**
 * Health Potions
 * 
 * Potions that restore HP (Health Points).
 * Essential for survival in combat.
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

// ========== MINOR HEALTH POTION ==========

export const MINOR_HEALTH_POTION = createPotionTemplate(
  'minor_health_potion',
  'Minor Health Potion',
  PotionCategory.HEALTH,
  PotionType.MINOR_HEALTH,
  [
    {
      type: PotionEffectType.RESTORE_HP,
      value: 50,
      description: 'Restores 50 HP',
    }
  ],
  {
    rarity: PotionRarity.COMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 1,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 10,
    recipe: {
      ingredients: [
        { materialId: 'healing_herb', quantity: 1 },
        { materialId: 'red_mushroom', quantity: 1 },
      ],
    },
  }
);

// ========== HEALTH POTION ==========

export const HEALTH_POTION = createPotionTemplate(
  'health_potion',
  'Health Potion',
  PotionCategory.HEALTH,
  PotionType.HEALTH,
  [
    {
      type: PotionEffectType.RESTORE_HP,
      value: 150,
      description: 'Restores 150 HP',
    }
  ],
  {
    rarity: PotionRarity.COMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 5,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 30,
    recipe: {
      ingredients: [
        { materialId: 'healing_herb', quantity: 2 },
        { materialId: 'moon_flower', quantity: 1 },
      ],
    },
  }
);

// ========== GREATER HEALTH POTION ==========

export const GREATER_HEALTH_POTION = createPotionTemplate(
  'greater_health_potion',
  'Greater Health Potion',
  PotionCategory.HEALTH,
  PotionType.GREATER_HEALTH,
  [
    {
      type: PotionEffectType.RESTORE_HP,
      value: 350,
      description: 'Restores 350 HP',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 15,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 100,
    recipe: {
      ingredients: [
        { materialId: 'moon_flower', quantity: 2 },
        { materialId: 'silverleaf', quantity: 1 },
        { materialId: 'magic_dust', quantity: 1 },
      ],
    },
  }
);

// ========== SUPERIOR HEALTH POTION ==========

export const SUPERIOR_HEALTH_POTION = createPotionTemplate(
  'superior_health_potion',
  'Superior Health Potion',
  PotionCategory.HEALTH,
  PotionType.SUPERIOR_HEALTH,
  [
    {
      type: PotionEffectType.RESTORE_HP,
      value: 700,
      description: 'Restores 700 HP',
    },
    {
      type: PotionEffectType.REGEN,
      value: 50,
      duration: 100,
      description: 'Restores 50 HP over time',
    }
  ],
  {
    rarity: PotionRarity.EPIC,
    targetType: PotionTargetType.SELF,
    requiredLevel: 30,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 300,
    recipe: {
      ingredients: [
        { materialId: 'golden_mushroom', quantity: 2 },
        { materialId: 'bloodroot', quantity: 2 },
        { materialId: 'magic_crystal', quantity: 2 },
      ],
    },
  }
);

// ========== LEGENDARY HEALTH POTION ==========

export const LEGENDARY_HEALTH_POTION = createPotionTemplate(
  'legendary_health_potion',
  'Legendary Health Potion',
  PotionCategory.HEALTH,
  PotionType.LEGENDARY_HEALTH,
  [
    {
      type: PotionEffectType.RESTORE_HP,
      value: 1500,
      description: 'Restores 1500 HP',
    },
    {
      type: PotionEffectType.REGEN,
      value: 100,
      duration: 200,
      description: 'Restores 100 HP over time',
    },
    {
      type: PotionEffectType.CURE_ALL,
      value: 1,
      description: 'Cures all status effects',
    }
  ],
  {
    rarity: PotionRarity.LEGENDARY,
    targetType: PotionTargetType.SELF,
    requiredLevel: 50,
    sources: [PotionSource.BOSS_DROP, PotionSource.QUEST_REWARD, PotionSource.EVENT],
    value: 1000,
    recipe: {
      ingredients: [
        { materialId: 'elder_lotus', quantity: 1 },
        { materialId: 'dragon_heart_root', quantity: 2 },
        { materialId: 'celestial_crystal', quantity: 3 },
      ],
    },
  }
);

// ========== ALLY HEALTH POTION ==========

export const ALLY_HEALTH_POTION = createPotionTemplate(
  'ally_health_potion',
  'Ally Health Potion',
  PotionCategory.HEALTH,
  PotionType.HEALTH,
  [
    {
      type: PotionEffectType.RESTORE_HP,
      value: 150,
      description: 'Restores 150 HP to target ally',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.ALLY,
    requiredLevel: 10,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP],
    value: 50,
    recipe: {
      ingredients: [
        { materialId: 'healing_herb', quantity: 3 },
        { materialId: 'moon_flower', quantity: 2 },
      ],
    },
  }
);

// ========== AREA HEALTH POTION ==========

export const AREA_HEALTH_POTION = createPotionTemplate(
  'area_health_potion',
  'Area Health Potion',
  PotionCategory.HEALTH,
  PotionType.GREATER_HEALTH,
  [
    {
      type: PotionEffectType.RESTORE_HP,
      value: 200,
      description: 'Restores 200 HP to all allies in range',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.AREA,
    range: 3,
    requiredLevel: 20,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 200,
    recipe: {
      ingredients: [
        { materialId: 'moon_flower', quantity: 3 },
        { materialId: 'silverleaf', quantity: 2 },
        { materialId: 'magic_crystal', quantity: 2 },
      ],
    },
  }
);

// ========== EXPORTS ==========

export const HEALTH_POTIONS = {
  minor_health_potion: MINOR_HEALTH_POTION,
  health_potion: HEALTH_POTION,
  greater_health_potion: GREATER_HEALTH_POTION,
  superior_health_potion: SUPERIOR_HEALTH_POTION,
  legendary_health_potion: LEGENDARY_HEALTH_POTION,
  ally_health_potion: ALLY_HEALTH_POTION,
  area_health_potion: AREA_HEALTH_POTION,
};

export type HealthPotionId = keyof typeof HEALTH_POTIONS;
