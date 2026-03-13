/**
 * Buff Potions
 * 
 * Potions that provide temporary stat boosts.
 * Essential for difficult battles and challenging content.
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

// ========== ATTACK BUFF POTIONS ==========

export const ATTACK_POTION = createPotionTemplate(
  'attack_potion',
  'Attack Potion',
  PotionCategory.BUFF,
  PotionType.ATTACK_POTION,
  [
    {
      type: PotionEffectType.BUFF_ATK,
      value: 15,
      duration: 200,
      description: '+15 Attack for 200 ticks',
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
        { materialId: 'wolf_hide', quantity: 1 },
        { materialId: 'red_mushroom', quantity: 1 },
      ],
    },
  }
);

export const GREATER_ATTACK_POTION = createPotionTemplate(
  'greater_attack_potion',
  'Greater Attack Potion',
  PotionCategory.BUFF,
  PotionType.ATTACK_POTION,
  [
    {
      type: PotionEffectType.BUFF_ATK,
      value: 30,
      duration: 300,
      description: '+30 Attack for 300 ticks',
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
        { materialId: 'boar_hide', quantity: 2 },
        { materialId: 'fire_essence', quantity: 2 },
      ],
    },
  }
);

// ========== DEFENSE BUFF POTIONS ==========

export const DEFENSE_POTION = createPotionTemplate(
  'defense_potion',
  'Defense Potion',
  PotionCategory.BUFF,
  PotionType.DEFENSE_POTION,
  [
    {
      type: PotionEffectType.BUFF_DEF,
      value: 15,
      duration: 200,
      description: '+15 Defense for 200 ticks',
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
        { materialId: 'bear_hide', quantity: 1 },
        { materialId: 'green_moss', quantity: 1 },
      ],
    },
  }
);

export const GREATER_DEFENSE_POTION = createPotionTemplate(
  'greater_defense_potion',
  'Greater Defense Potion',
  PotionCategory.BUFF,
  PotionType.DEFENSE_POTION,
  [
    {
      type: PotionEffectType.BUFF_DEF,
      value: 30,
      duration: 300,
      description: '+30 Defense for 300 ticks',
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
        { materialId: 'tiger_hide', quantity: 2 },
        { materialId: 'earth_essence', quantity: 2 },
      ],
    },
  }
);

// ========== SPEED BUFF POTIONS ==========

export const SPEED_POTION = createPotionTemplate(
  'speed_potion',
  'Speed Potion',
  PotionCategory.BUFF,
  PotionType.SPEED_POTION,
  [
    {
      type: PotionEffectType.BUFF_SPEED,
      value: 10,
      duration: 150,
      description: '+10 Speed for 150 ticks',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 10,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 50,
    recipe: {
      ingredients: [
        { materialId: 'wind_essence', quantity: 2 },
        { materialId: 'raptor_feather', quantity: 1 },
      ],
    },
  }
);

export const GREATER_SPEED_POTION = createPotionTemplate(
  'greater_speed_potion',
  'Greater Speed Potion',
  PotionCategory.BUFF,
  PotionType.SPEED_POTION,
  [
    {
      type: PotionEffectType.BUFF_SPEED,
      value: 20,
      duration: 250,
      description: '+20 Speed for 250 ticks',
    }
  ],
  {
    rarity: PotionRarity.EPIC,
    targetType: PotionTargetType.SELF,
    requiredLevel: 30,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 200,
    recipe: {
      ingredients: [
        { materialId: 'thunderbird_feather', quantity: 2 },
        { materialId: 'thunder_essence', quantity: 2 },
      ],
    },
  }
);

// ========== MAGIC BUFF POTIONS ==========

export const MAGIC_POTION = createPotionTemplate(
  'magic_potion',
  'Magic Potion',
  PotionCategory.BUFF,
  PotionType.MAGIC_POTION,
  [
    {
      type: PotionEffectType.BUFF_MAG,
      value: 15,
      duration: 200,
      description: '+15 Magic for 200 ticks',
    }
  ],
  {
    rarity: PotionRarity.UNCOMMON,
    targetType: PotionTargetType.SELF,
    requiredLevel: 10,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.MOB_DROP],
    value: 50,
    recipe: {
      ingredients: [
        { materialId: 'magic_dust', quantity: 2 },
        { materialId: 'blue_mushroom', quantity: 1 },
      ],
    },
  }
);

export const GREATER_MAGIC_POTION = createPotionTemplate(
  'greater_magic_potion',
  'Greater Magic Potion',
  PotionCategory.BUFF,
  PotionType.MAGIC_POTION,
  [
    {
      type: PotionEffectType.BUFF_MAG,
      value: 30,
      duration: 300,
      description: '+30 Magic for 300 ticks',
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
        { materialId: 'arcane_crystal', quantity: 2 },
        { materialId: 'mystic_crystal', quantity: 3 },
      ],
    },
  }
);

// ========== CRITICAL BUFF POTIONS ==========

export const CRITICAL_POTION = createPotionTemplate(
  'critical_potion',
  'Critical Potion',
  PotionCategory.BUFF,
  PotionType.CRITICAL_POTION,
  [
    {
      type: PotionEffectType.BUFF_CRIT,
      value: 10,
      duration: 200,
      description: '+10 Critical Rate for 200 ticks',
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
        { materialId: 'wolf_claw', quantity: 2 },
        { materialId: 'silverleaf', quantity: 1 },
      ],
    },
  }
);

// ========== EVASION BUFF POTIONS ==========

export const EVASION_POTION = createPotionTemplate(
  'evasion_potion',
  'Evasion Potion',
  PotionCategory.BUFF,
  PotionType.EVASION_POTION,
  [
    {
      type: PotionEffectType.BUFF_EVA,
      value: 10,
      duration: 200,
      description: '+10 Evasion for 200 ticks',
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
        { materialId: 'spider_silk', quantity: 2 },
        { materialId: 'wind_essence', quantity: 1 },
      ],
    },
  }
);

// ========== REGEN POTIONS ==========

export const REGEN_POTION = createPotionTemplate(
  'regen_potion',
  'Regeneration Potion',
  PotionCategory.BUFF,
  PotionType.REGEN_POTION,
  [
    {
      type: PotionEffectType.REGEN,
      value: 20,
      duration: 300,
      description: 'Restores 20 HP per tick for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 20,
    sources: [PotionSource.CRAFTING, PotionSource.SHOP, PotionSource.BOSS_DROP],
    value: 120,
    recipe: {
      ingredients: [
        { materialId: 'bloodroot', quantity: 2 },
        { materialId: 'moon_flower', quantity: 2 },
        { materialId: 'water_essence', quantity: 1 },
      ],
    },
  }
);

// ========== COMBO BUFF POTIONS ==========

export const WARRIOR_BREW = createPotionTemplate(
  'warrior_brew',
  'Warrior Brew',
  PotionCategory.BUFF,
  PotionType.ATTACK_POTION,
  [
    {
      type: PotionEffectType.BUFF_ATK,
      value: 25,
      duration: 250,
      description: '+25 Attack for 250 ticks',
    },
    {
      type: PotionEffectType.BUFF_DEF,
      value: 15,
      duration: 250,
      description: '+15 Defense for 250 ticks',
    }
  ],
  {
    rarity: PotionRarity.EPIC,
    targetType: PotionTargetType.SELF,
    requiredLevel: 25,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 200,
    recipe: {
      ingredients: [
        { materialId: 'boar_hide', quantity: 2 },
        { materialId: 'bear_hide', quantity: 2 },
        { materialId: 'fire_essence', quantity: 2 },
        { materialId: 'earth_essence', quantity: 1 },
      ],
    },
  }
);

export const MAGE_ELIXIR = createPotionTemplate(
  'mage_elixir',
  'Mage Elixir',
  PotionCategory.BUFF,
  PotionType.MAGIC_POTION,
  [
    {
      type: PotionEffectType.BUFF_MAG,
      value: 25,
      duration: 250,
      description: '+25 Magic for 250 ticks',
    },
    {
      type: PotionEffectType.BUFF_INT,
      value: 15,
      duration: 250,
      description: '+15 INT for 250 ticks',
    }
  ],
  {
    rarity: PotionRarity.EPIC,
    targetType: PotionTargetType.SELF,
    requiredLevel: 25,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 200,
    recipe: {
      ingredients: [
        { materialId: 'arcane_crystal', quantity: 2 },
        { materialId: 'silverleaf', quantity: 2 },
        { materialId: 'mystic_crystal', quantity: 3 },
      ],
    },
  }
);

// ========== EXPORTS ==========

export const BUFF_POTIONS = {
  // Attack
  attack_potion: ATTACK_POTION,
  greater_attack_potion: GREATER_ATTACK_POTION,
  
  // Defense
  defense_potion: DEFENSE_POTION,
  greater_defense_potion: GREATER_DEFENSE_POTION,
  
  // Speed
  speed_potion: SPEED_POTION,
  greater_speed_potion: GREATER_SPEED_POTION,
  
  // Magic
  magic_potion: MAGIC_POTION,
  greater_magic_potion: GREATER_MAGIC_POTION,
  
  // Critical & Evasion
  critical_potion: CRITICAL_POTION,
  evasion_potion: EVASION_POTION,
  
  // Regen
  regen_potion: REGEN_POTION,
  
  // Combo
  warrior_brew: WARRIOR_BREW,
  mage_elixir: MAGE_ELIXIR,
};

export type BuffPotionId = keyof typeof BUFF_POTIONS;
