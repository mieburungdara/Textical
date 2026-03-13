/**
 * Mana Potions
 * 
 * Potions that restore MP/Mana for casting skills.
 * Essential for mages and skill-dependent classes.
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

// ========== MINOR MANA POTION ==========

export const MINOR_MANA_POTION = createPotionTemplate(
  'minor_mana_potion',
  'Minor Mana Potion',
  PotionCategory.MANA,
  PotionType.MINOR_MANA,
  [
    {
      type: PotionEffectType.RESTORE_MANA,
      value: 30,
      description: 'Restores 30 Mana',
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
        { materialId: 'blue_mushroom', quantity: 1 },
        { materialId: 'magic_dust', quantity: 1 },
      ],
    },
  }
);

// ========== MANA POTION ==========

export const MANA_POTION = createPotionTemplate(
  'mana_potion',
  'Mana Potion',
  PotionCategory.MANA,
  PotionType.MANA,
  [
    {
      type: PotionEffectType.RESTORE_MANA,
      value: 80,
      description: 'Restores 80 Mana',
    }
  ],
  {
    rarity: PotionRarity.COMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 5,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 40,
    recipe: {
      ingredients: [
        { materialId: 'blue_mushroom', quantity: 2 },
        { materialId: 'moon_flower', quantity: 1 },
        { materialId: 'magic_dust', quantity: 1 },
      ],
    },
  }
);

// ========== GREATER MANA POTION ==========

export const GREATER_MANA_POTION = createPotionTemplate(
  'greater_mana_potion',
  'Greater Mana Potion',
  PotionCategory.MANA,
  PotionType.GREATER_MANA,
  [
    {
      type: PotionEffectType.RESTORE_MANA,
      value: 200,
      description: 'Restores 200 Mana',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 15,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.BOSS_DROP],
    value: 120,
    recipe: {
      ingredients: [
        { materialId: 'silverleaf', quantity: 2 },
        { materialId: 'magic_crystal', quantity: 2 },
      ],
    },
  }
);

// ========== SUPERIOR MANA POTION ==========

export const SUPERIOR_MANA_POTION = createPotionTemplate(
  'superior_mana_potion',
  'Superior Mana Potion',
  PotionCategory.MANA,
  PotionType.SUPERIOR_MANA,
  [
    {
      type: PotionEffectType.RESTORE_MANA,
      value: 400,
      description: 'Restores 400 Mana',
    },
    {
      type: PotionEffectType.BUFF_INT,
      value: 10,
      duration: 150,
      description: '+10 INT for 150 ticks',
    }
  ],
  {
    rarity: PotionRarity.EPIC,
    targetType: PotionTargetType.SELF,
    requiredLevel: 30,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 350,
    recipe: {
      ingredients: [
        { materialId: 'golden_mushroom', quantity: 2 },
        { materialId: 'arcane_crystal', quantity: 2 },
        { materialId: 'mystic_crystal', quantity: 3 },
      ],
    },
  }
);

// ========== LEGENDARY MANA POTION ==========

export const LEGENDARY_MANA_POTION = createPotionTemplate(
  'legendary_mana_potion',
  'Legendary Mana Potion',
  PotionCategory.MANA,
  PotionType.LEGENDARY_MANA,
  [
    {
      type: PotionEffectType.RESTORE_MANA,
      value: 800,
      description: 'Restores 800 Mana',
    },
    {
      type: PotionEffectType.BUFF_INT,
      value: 20,
      duration: 300,
      description: '+20 INT for 300 ticks',
    },
    {
      type: PotionEffectType.BUFF_MAG,
      value: 20,
      duration: 300,
      description: '+20 Magic for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.LEGENDARY,
    targetType: PotionTargetType.SELF,
    requiredLevel: 50,
    sources: [PotionSource.BOSS_DROP, PotionSource.QUEST_REWARD, PotionSource.EVENT],
    value: 1200,
    recipe: {
      ingredients: [
        { materialId: 'elder_lotus', quantity: 1 },
        { materialId: 'celestial_crystal', quantity: 3 },
        { materialId: 'arcane_crystal', quantity: 5 },
      ],
    },
  }
);

// ========== MANA SURGE POTION ==========

export const MANA_SURGE_POTION = createPotionTemplate(
  'mana_surge_potion',
  'Mana Surge Potion',
  PotionCategory.MANA,
  PotionType.SUPERIOR_MANA,
  [
    {
      type: PotionEffectType.RESTORE_MANA,
      value: 500,
      description: 'Restores 500 Mana instantly',
    },
    {
      type: PotionEffectType.BUFF_MAG,
      value: 15,
      duration: 200,
      description: '+15 Magic for 200 ticks',
    }
  ],
  {
    rarity: PotionRarity.EPIC,
    targetType: PotionTargetType.SELF,
    requiredLevel: 35,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 400,
    recipe: {
      ingredients: [
        { materialId: 'ghost_mushroom', quantity: 2 },
        { materialId: 'arcane_crystal', quantity: 3 },
        { materialId: 'ether_crystal', quantity: 1 },
      ],
    },
  }
);

// ========== EXPORTS ==========

export const MANA_POTIONS = {
  minor_mana_potion: MINOR_MANA_POTION,
  mana_potion: MANA_POTION,
  greater_mana_potion: GREATER_MANA_POTION,
  superior_mana_potion: SUPERIOR_MANA_POTION,
  legendary_mana_potion: LEGENDARY_MANA_POTION,
  mana_surge_potion: MANA_SURGE_POTION,
};

export type ManaPotionId = keyof typeof MANA_POTIONS;
