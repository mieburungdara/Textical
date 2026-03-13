/**
 * Special Potions
 * 
 * Potions with unique and powerful effects.
 * Rare and often quest-exclusive.
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

// ========== INVISIBILITY ==========

export const INVISIBILITY = createPotionTemplate(
  'invisibility',
  'Invisibility Potion',
  PotionCategory.SPECIAL,
  PotionType.INVISIBILITY,
  [
    {
      type: PotionEffectType.INVISIBLE,
      value: 1,
      duration: 200,
      description: 'Makes unit invisible for 200 ticks (enemies cannot target, but CAN still take damage from AOE/skills)',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 20,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 200,
    recipe: {
      ingredients: [
        { materialId: 'ghost_mushroom', quantity: 2 },
        { materialId: 'spider_silk', quantity: 2 },
        { materialId: 'shadow_crystal', quantity: 1 },
      ],
    },
  }
);

// ========== SWIFT FEET ==========

export const SWIFT_FEET = createPotionTemplate(
  'swift_feet',
  'Swift Feet Potion',
  PotionCategory.SPECIAL,
  PotionType.SWIFT_FEET,
  [
    {
      type: PotionEffectType.BUFF_SPEED,
      value: 30,
      duration: 200,
      description: '+30 Speed for 200 ticks',
    },
    {
      type: PotionEffectType.BUFF_EVA,
      value: 15,
      duration: 200,
      description: '+15 Evasion for 200 ticks',
    }
  ],
  {
    rarity: PotionRarity.RARE,
    targetType: PotionTargetType.SELF,
    requiredLevel: 25,
    sources: [PotionSource.CRAFTING, PotionSource.BOSS_DROP],
    value: 180,
    recipe: {
      ingredients: [
        { materialId: 'thunderbird_feather', quantity: 2 },
        { materialId: 'wind_essence', quantity: 3 },
        { materialId: 'spider_silk', quantity: 1 },
      ],
    },
  }
);

// ========== PHASE SHIFT ==========

export const PHASE_SHIFT = createPotionTemplate(
  'phase_shift',
  'Phase Shift Potion',
  PotionCategory.SPECIAL,
  PotionType.PHASE_SHIFT,
  [
    {
      type: PotionEffectType.PHASED,
      value: 1,
      duration: 150,
      description: 'Phase shift for 150 ticks (can pass through enemies, but CAN still take damage from attacks)',
    },
    {
      type: PotionEffectType.BUFF_EVA,
      value: 20,
      duration: 150,
      description: '+20 Evasion while phased',
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
        { materialId: 'ether_crystal', quantity: 2 },
        { materialId: 'ghost_mushroom', quantity: 2 },
        { materialId: 'shadow_crystal', quantity: 1 },
      ],
    },
  }
);

// ========== DIVINE PROTECTION ==========

export const DIVINE_PROTECTION = createPotionTemplate(
  'divine_protection',
  'Divine Protection Potion',
  PotionCategory.SPECIAL,
  PotionType.DIVINE_PROTECTION,
  [
    {
      type: PotionEffectType.BLESSED,
      value: 1,
      duration: 300,
      description: 'Divine protection for 300 ticks',
    },
    {
      type: PotionEffectType.RESIST_DARKNESS,
      value: 100,
      duration: 300,
      description: '+100% Darkness Resistance',
    },
    {
      type: PotionEffectType.IMMUNE_CURSE,
      value: 1,
      duration: 300,
      description: 'Curse Immunity',
    },
    {
      type: PotionEffectType.BUFF_DEF,
      value: 30,
      duration: 300,
      description: '+30 Defense',
    }
  ],
  {
    rarity: PotionRarity.LEGENDARY,
    targetType: PotionTargetType.SELF,
    requiredLevel: 45,
    sources: [PotionSource.BOSS_DROP, PotionSource.QUEST_REWARD, PotionSource.EVENT],
    value: 800,
    recipe: {
      ingredients: [
        { materialId: 'elder_lotus', quantity: 1 },
        { materialId: 'celestial_crystal', quantity: 2 },
        { materialId: 'holy_essence', quantity: 3 },
        { materialId: 'soul_gem', quantity: 1 },
      ],
    },
  }
);

// ========== DRAGON BLOOD ==========

export const DRAGON_BLOOD = createPotionTemplate(
  'dragon_blood',
  'Dragon Blood Potion',
  PotionCategory.SPECIAL,
  PotionType.DRAGON_BLOOD,
  [
    {
      type: PotionEffectType.BUFF_ATK,
      value: 40,
      duration: 400,
      description: '+40 Attack for 400 ticks',
    },
    {
      type: PotionEffectType.BUFF_DEF,
      value: 25,
      duration: 400,
      description: '+25 Defense for 400 ticks',
    },
    {
      type: PotionEffectType.RESIST_FIRE,
      value: 80,
      duration: 400,
      description: '+80% Fire Resistance',
    },
    {
      type: PotionEffectType.HEAL_OVER_TIME,
      value: 30,
      duration: 400,
      description: 'Restores 30 HP per tick',
    }
  ],
  {
    rarity: PotionRarity.LEGENDARY,
    targetType: PotionTargetType.SELF,
    requiredLevel: 50,
    sources: [PotionSource.BOSS_DROP, PotionSource.RAID_DROP, PotionSource.EVENT],
    value: 1500,
    recipe: {
      ingredients: [
        { materialId: 'dragon_scale', quantity: 3 },
        { materialId: 'ancient_dragon_scale', quantity: 1 },
        { materialId: 'dragon_claw', quantity: 2 },
        { materialId: 'primordial_fire', quantity: 1 },
      ],
    },
  }
);

// ========== ELIXIR OF LIFE ==========

export const ELIXIR_OF_LIFE = createPotionTemplate(
  'elixir_of_life',
  'Elixir of Life',
  PotionCategory.SPECIAL,
  PotionType.LEGENDARY_HEALTH,
  [
    {
      type: PotionEffectType.RESTORE_HP,
      value: 9999,
      description: 'Restores 9999 HP (full heal)',
    },
    {
      type: PotionEffectType.CURE_ALL,
      value: 1,
      description: 'Cures all status effects',
    },
    {
      type: PotionEffectType.REGEN,
      value: 100,
      duration: 500,
      description: 'Restores 100 HP per tick for 500 ticks',
    }
  ],
  {
    rarity: PotionRarity.LEGENDARY,
    targetType: PotionTargetType.SELF,
    requiredLevel: 40,
    sources: [PotionSource.BOSS_DROP, PotionSource.QUEST_REWARD, PotionSource.EVENT],
    value: 2000,
    recipe: {
      ingredients: [
        { materialId: 'elder_lotus', quantity: 2 },
        { materialId: 'phoenix_feather', quantity: 1 },
        { materialId: 'celestial_crystal', quantity: 3 },
        { materialId: 'soul_gem', quantity: 1 },
      ],
    },
  }
);

// ========== ELIXIR OF WISDOM ==========

export const ELIXIR_OF_WISDOM = createPotionTemplate(
  'elixir_of_wisdom',
  'Elixir of Wisdom',
  PotionCategory.SPECIAL,
  PotionType.LEGENDARY_MANA,
  [
    {
      type: PotionEffectType.RESTORE_MANA,
      value: 9999,
      description: 'Restores 9999 Mana (full restore)',
    },
    {
      type: PotionEffectType.BUFF_MAG,
      value: 50,
      duration: 500,
      description: '+50 Magic for 500 ticks',
    },
    {
      type: PotionEffectType.BUFF_INT,
      value: 30,
      duration: 500,
      description: '+30 INT for 500 ticks',
    }
  ],
  {
    rarity: PotionRarity.LEGENDARY,
    targetType: PotionTargetType.SELF,
    requiredLevel: 40,
    sources: [PotionSource.BOSS_DROP, PotionSource.QUEST_REWARD, PotionSource.EVENT],
    value: 2000,
    recipe: {
      ingredients: [
        { materialId: 'lotus_of_death', quantity: 1 },
        { materialId: 'elder_lotus', quantity: 1 },
        { materialId: 'arcane_crystal', quantity: 3 },
        { materialId: 'ether_crystal', quantity: 2 },
      ],
    },
  }
);

// ========== GIANTS STRENGTH ==========

export const GIANTS_STRENGTH = createPotionTemplate(
  'giants_strength',
  "Giant's Strength Potion",
  PotionCategory.SPECIAL,
  PotionType.ATTACK_POTION,
  [
    {
      type: PotionEffectType.BUFF_ATK,
      value: 50,
      duration: 300,
      description: '+50 Attack for 300 ticks',
    },
    {
      type: PotionEffectType.BUFF_VIT,
      value: 20,
      duration: 300,
      description: '+20 VIT for 300 ticks',
    },
    {
      type: PotionEffectType.BUFF_CRIT,
      value: 15,
      duration: 300,
      description: '+15 Critical Rate for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.LEGENDARY,
    targetType: PotionTargetType.SELF,
    requiredLevel: 45,
    sources: [PotionSource.RAID_DROP, PotionSource.EVENT],
    value: 1000,
    recipe: {
      ingredients: [
        { materialId: 'ogre_tooth', quantity: 3 },
        { materialId: 'troll_bone', quantity: 2 },
        { materialId: 'demon_teeth', quantity: 1 },
        { materialId: 'primordial_fire', quantity: 1 },
      ],
    },
  }
);

// ========== TITAN'S MIGHT ==========

export const TITANS_MIGHT = createPotionTemplate(
  'titans_might',
  "Titan's Might Potion",
  PotionCategory.SPECIAL,
  PotionType.DEFENSE_POTION,
  [
    {
      type: PotionEffectType.BUFF_DEF,
      value: 50,
      duration: 300,
      description: '+50 Defense for 300 ticks',
    },
    {
      type: PotionEffectType.BUFF_VIT,
      value: 30,
      duration: 300,
      description: '+30 VIT for 300 ticks',
    },
    {
      type: PotionEffectType.IMMUNE_STUN,
      value: 1,
      duration: 300,
      description: 'Stun Immunity for 300 ticks',
    }
  ],
  {
    rarity: PotionRarity.LEGENDARY,
    targetType: PotionTargetType.SELF,
    requiredLevel: 45,
    sources: [PotionSource.RAID_DROP, PotionSource.EVENT],
    value: 1000,
    recipe: {
      ingredients: [
        { materialId: 'basilisk_scale', quantity: 2 },
        { materialId: 'gargoyle_scale', quantity: 2 },
        { materialId: 'adamantite_ore', quantity: 3 },
        { materialId: 'earth_essence', quantity: 2 },
      ],
    },
  }
);

// ========== EXPORTS ==========

export const SPECIAL_POTIONS = {
  // Utility
  invisibility: INVISIBILITY,
  swift_feet: SWIFT_FEET,
  phase_shift: PHASE_SHIFT,
  
  // Divine
  divine_protection: DIVINE_PROTECTION,
  
  // Legendary
  dragon_blood: DRAGON_BLOOD,
  elixir_of_life: ELIXIR_OF_LIFE,
  elixir_of_wisdom: ELIXIR_OF_WISDOM,
  giants_strength: GIANTS_STRENGTH,
  titans_might: TITANS_MIGHT,
};

export type SpecialPotionId = keyof typeof SPECIAL_POTIONS;
