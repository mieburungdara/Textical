/**
 * Potion Template System
 * 
 * Defines all potions used in the game for healing, buffing, and utility.
 * Potions can be crafted, purchased, or obtained from monsters/quests.
 */

// ========== POTION CATEGORY ==========

export enum PotionCategory {
  HEALTH = 'health',           // HP restoration
  MANA = 'mana',               // MP/Energy restoration
  STAMINA = 'stamina',         // Stamina restoration
  BUFF = 'buff',               // Stat boost potions
  CURE = 'cure',               // Remove negative effects
  RESISTANCE = 'resistance',   // Elemental/status immunity
  SPECIAL = 'special',         // Unique effects
  EXPERIENCE = 'experience',   // XP boost
}

// ========== POTION TYPE ==========

export enum PotionType {
  // Health
  MINOR_HEALTH = 'minor_health',
  HEALTH = 'health',
  GREATER_HEALTH = 'greater_health',
  SUPERIOR_HEALTH = 'superior_health',
  LEGENDARY_HEALTH = 'legendary_health',
  
  // Mana
  MINOR_MANA = 'minor_mana',
  MANA = 'mana',
  GREATER_MANA = 'greater_mana',
  SUPERIOR_MANA = 'superior_mana',
  LEGENDARY_MANA = 'legendary_mana',
  
  // Stamina
  MINOR_STAMINA = 'minor_stamina',
  STAMINA = 'stamina',
  GREATER_STAMINA = 'greater_stamina',
  
  // Buff Potions
  ATTACK_POTION = 'attack_potion',
  DEFENSE_POTION = 'defense_potion',
  SPEED_POTION = 'speed_potion',
  MAGIC_POTION = 'magic_potion',
  CRITICAL_POTION = 'critical_potion',
  EVASION_POTION = 'evasion_potion',
  REGEN_POTION = 'regen_potion',
  
  // Stat Potions (permanent or semi-permanent)
  STR_POTION = 'str_potion',
  DEF_POTION = 'def_potion',
  INT_POTION = 'int_potion',
  DEX_POTION = 'dex_potion',
  VIT_POTION = 'vit_potion',
  
  // Cure Potions
  ANTIDOTE = 'antidote',
  CLEANSE = 'cleanse',
  AWAKEN = 'awaken',
  STONESKIN = 'stoneskin',
  
  // Resistance Potions
  FIRE_RESISTANCE = 'fire_resistance',
  ICE_RESISTANCE = 'ice_resistance',
  LIGHTNING_RESISTANCE = 'lightning_resistance',
  DARKNESS_RESISTANCE = 'darkness_resistance',
  HOLY_RESISTANCE = 'holy_resistance',
  ELEMENTAL_AEGIS = 'elemental_aegis',
  
  // Status Immunity
  ANTIPOISON = 'antipoison',
  ANTISTUN = 'antistun',
  ANTI_CURSE = 'anti_curse',
  STATUS_SHIELD = 'status_shield',
  
  // Special Potions
  INVISIBILITY = 'invisibility',
  SWIFT_FEET = 'swift_feet',
  PHASE_SHIFT = 'phase_shift',
  DIVINE_PROTECTION = 'divine_protection',
  DRAGON_BLOOD = 'dragon_blood',
  
  // XP Potions
  XP_BOOST = 'xp_boost',
  GOLD_BOOST = 'gold_boost',
  DROP_BOOST = 'drop_boost',
}

// ========== POTION EFFECT INTERFACE ==========

export interface PotionEffect {
  type: PotionEffectType;
  value: number;
  duration?: number;  // For buffs (in ticks), 0 = instant
  description: string;
}

export enum PotionEffectType {
  // Restoration
  RESTORE_HP = 'restore_hp',
  RESTORE_MANA = 'restore_mana',
  RESTORE_STAMINA = 'restore_stamima',
  
  // Stat Buffs
  BUFF_ATK = 'buff_atk',
  BUFF_DEF = 'buff_def',
  BUFF_DEX = 'buff_dex',
  BUFF_INT = 'buff_int',
  BUFF_VIT = 'buff_vit',
  BUFF_MAG = 'buff_mag',
  BUFF_SPEED = 'buff_speed',
  BUFF_CRIT = 'buff_crit',
  BUFF_EVA = 'buff_eva',
  
  // Healing Over Time
  HEAL_OVER_TIME = 'heal_over_time',
  REGEN = 'regen',
  
  // Status Removal
  CURE_POISON = 'cure_poison',
  CURE_STUN = 'cure_stun',
  CURE_SILENCE = 'cure_silence',
  CURE_CURSE = 'cure_curse',
  CURE_BLIND = 'cure_blind',
  CURE_SLEEP = 'cure_sleep',
  CURE_FREEZE = 'cure_freeze',
  CURE_ROOT = 'cure_root',
  CURE_ALL = 'cure_all',
  
  // Resistance
  RESIST_FIRE = 'resist_fire',
  RESIST_ICE = 'resist_ice',
  RESIST_LIGHTNING = 'resist_lightning',
  RESIST_DARKNESS = 'resist_darkness',
  RESIST_HOLY = 'resist_holy',
  
  // Immunity
  IMMUNE_POISON = 'immune_poison',
  IMMUNE_STUN = 'immune_stun',
  IMMUNE_SILENCE = 'immune_silence',
  IMMUNE_CURSE = 'immune_curse',
  IMMUNE_ALL = 'immune_all',
  
  // Special
  // NOTE: INVISIBLE - Unit cannot be targeted by enemies, but CAN still take damage from AOE/skills
  INVISIBLE = 'invisible',
  // PHASED - Unit can pass through enemies, but CAN still take damage from attacks
  PHASED = 'phased',
  BLESSED = 'blessed',
  
  // Boost
  XP_MULTIPLIER = 'xp_multiplier',
  GOLD_MULTIPLIER = 'gold_multiplier',
  DROP_MULTIPLIER = 'drop_multiplier',
}

// ========== POTION RARITY ==========

export enum PotionRarity {
  COMMON = 'common',           // Basic potions
  UNCOMMON = 'uncommon',       // Enhanced potions
  RARE = 'rare',               // Greater potions
  EPIC = 'epic',               // Superior potions
  LEGENDARY = 'legendary',     // Legendary potions
}

// ========== POTION SOURCE ==========

export enum PotionSource {
  CRAFTING = 'crafting',       // Can be crafted
  SHOP = 'shop',               // Can be purchased
  MOB_DROP = 'mob_drop',       // Monster drop
  BOSS_DROP = 'boss_drop',     // Boss drop
  RAID_DROP = 'raid_drop',     // Raid boss drop
  QUEST_REWARD = 'quest_reward', // Quest reward
  EVENT = 'event',            // Event-exclusive
}

// ========== POTION TEMPLATE ==========

export interface PotionTemplate {
  id: string;
  name: string;
  description: string;
  
  // Categorization
  category: PotionCategory;
  type: PotionType;
  rarity: PotionRarity;
  
  // Effects
  effects: PotionEffect[];
  
  // Usage
  targetType: PotionTargetType;
  range?: number;
  cooldown?: number;  // In ticks
  charges?: number;
  
  // Requirements
  requiredLevel?: number;
  requiredClass?: string[];
  
  // Sources
  sources: PotionSource[];
  
  // Value
  value?: number;  // Gold value when selling
  stackSize?: number;
  
  // Crafting recipe (if craftable)
  recipe?: PotionRecipe;
}

// ========== POTION TARGET TYPE ==========

export enum PotionTargetType {
  SELF = 'self',       // Target self only
  ALLY = 'ally',       // Can target allies
  ENEMY = 'enemy',     // Can target enemies
  AREA = 'area',       // Area of effect
  ANY = 'any',         // Any target
}

// ========== POTION RECIPE ==========

export interface PotionRecipe {
  ingredients: RecipeIngredient[];
  requiredSkill?: string;
  requiredSkillLevel?: number;
  craftTime?: number;  // In ticks
}

export interface RecipeIngredient {
  materialId: string;
  quantity: number;
}

// ========== HELPER FUNCTIONS ==========

/**
 * Create a potion template
 */
export function createPotionTemplate(
  id: string,
  name: string,
  category: PotionCategory,
  type: PotionType,
  effects: PotionEffect[],
  options: Partial<PotionTemplate> = {}
): PotionTemplate {
  return {
    id,
    name,
    description: options.description || `${name} potion`,
    category,
    type,
    rarity: options.rarity || PotionRarity.COMMON,
    effects,
    targetType: options.targetType || PotionTargetType.SELF,
    range: options.range,
    cooldown: options.cooldown || 0,
    charges: options.charges || 1,
    requiredLevel: options.requiredLevel || 1,
    requiredClass: options.requiredClass,
    sources: options.sources || [PotionSource.CRAFTING, PotionSource.SHOP],
    value: options.value || 10,
    stackSize: options.stackSize || 99,
    recipe: options.recipe,
  };
}

/**
 * Get potion rarity color (for UI)
 */
export function getPotionRarityColor(rarity: PotionRarity): string {
  const colors: Record<PotionRarity, string> = {
    [PotionRarity.COMMON]: '#9d9d9d',    // Gray
    [PotionRarity.UNCOMMON]: '#1eff00',  // Green
    [PotionRarity.RARE]: '#0070dd',      // Blue
    [PotionRarity.EPIC]: '#a335ee',      // Purple
    [PotionRarity.LEGENDARY]: '#ff8000', // Orange
  };
  return colors[rarity];
}

/**
 * Get potion tier from rarity
 */
export function getPotionTier(rarity: PotionRarity): number {
  const tiers: Record<PotionRarity, number> = {
    [PotionRarity.COMMON]: 1,
    [PotionRarity.UNCOMMON]: 2,
    [PotionRarity.RARE]: 3,
    [PotionRarity.EPIC]: 4,
    [PotionRarity.LEGENDARY]: 5,
  };
  return tiers[rarity];
}
