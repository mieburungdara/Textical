/**
 * Creature Base Types
 * 
 * Defines the interface for creature templates.
 * Each creature family has a base template that can be extended with class/element.
 */

import { ElementType } from '../elements/index.js';
import { WeaponType } from '../items/index.js';

// ========== CREATURE KIND ==========

export enum CreatureKind {
  MONSTER = 'monster',
  PLAYER = 'player',
  NPC = 'npc',
  SUMMON = 'summon',
}

// ========== UNIT TRAITS ==========
// Special traits that affect combat interactions

export enum UnitTrait {
  FLY = 'fly',           // Flying unit - immune to melee attacks
  AQUATIC = 'aquatic',   // Water-only unit
  BURROW = 'burrow',     // Underground unit
  GHOST = 'ghost',       // Ethereal - immune to physical
  MECHANICAL = 'mechanical', // Machine - immune to poison
  UNDEAD = 'undead',     // Undead - immune to poison
  CONSTRUCT = 'construct', // Construct - immune to mind effects
  BOSS = 'boss',         // Boss unit - cannot be bypassed
  ELITE = 'elite',       // Elite unit
  MINI_BOSS = 'mini_boss', // Mini boss
  VAMPIRE = 'vampire',   // Vampire - gains lifeSteal on attack
  ARCANE = 'arcane',     // Arcane affinity - gains spellVamp on spell damage
  LEGENDARY = 'legendary', // Legendary - strongest non-boss unit
}

// ========== COMBAT TYPE ==========
// Type of attack/combat

export enum CombatType {
  MELEE = 'melee',     // Close combat (attackRange = 1)
  RANGED = 'ranged',   // Long-range attacks
  MAGIC = 'magic',     // Magical attacks
  AREA = 'area',       // Area of effect
}

// ========== SIZE CATEGORY ==========
// Size affects damage calculations and combat interactions

export enum SizeCategory {
  TINY = 1,     // Mice, insects - very small
  SMALL = 2,    // Cats, goblins
  MEDIUM = 3,   // Humans, orcs, wolves
  LARGE = 4,    // Ogres, trolls, dragons
  GIANT = 5,    // Giants, ancient dragons
}

// Size damage multipliers
export const SIZE_DAMAGE_MULTIPLIER: Record<SizeCategory, Record<SizeCategory, number>> = {
  // Attacker size → Target size → Multiplier
  [SizeCategory.TINY]: {
    [SizeCategory.TINY]: 1.0,
    [SizeCategory.SMALL]: 1.0,
    [SizeCategory.MEDIUM]: 0.5,   // Too small to hurt medium
    [SizeCategory.LARGE]: 0.25,   // Can't hurt large
    [SizeCategory.GIANT]: 0.1,    // Can't hurt giant
  },
  [SizeCategory.SMALL]: {
    [SizeCategory.TINY]: 1.5,
    [SizeCategory.SMALL]: 1.0,
    [SizeCategory.MEDIUM]: 0.75,
    [SizeCategory.LARGE]: 0.5,
    [SizeCategory.GIANT]: 0.25,
  },
  [SizeCategory.MEDIUM]: {
    [SizeCategory.TINY]: 2.0,
    [SizeCategory.SMALL]: 1.5,
    [SizeCategory.MEDIUM]: 1.0,
    [SizeCategory.LARGE]: 0.75,
    [SizeCategory.GIANT]: 0.5,
  },
  [SizeCategory.LARGE]: {
    [SizeCategory.TINY]: 2.5,
    [SizeCategory.SMALL]: 2.0,
    [SizeCategory.MEDIUM]: 1.5,
    [SizeCategory.LARGE]: 1.0,
    [SizeCategory.GIANT]: 0.75,
  },
  [SizeCategory.GIANT]: {
    [SizeCategory.TINY]: 3.0,
    [SizeCategory.SMALL]: 2.5,
    [SizeCategory.MEDIUM]: 2.0,
    [SizeCategory.LARGE]: 1.5,
    [SizeCategory.GIANT]: 1.0,
  },
};

// Bonus damage against larger targets (for skills like "Smite")
export const SIZE_BONUS_VS_LARGER: Record<number, number> = {
  1: 2.0,   // +100% vs 1 size larger
  2: 1.5,   // +50% vs 2 sizes larger
  3: 1.25,  // +25% vs 3 sizes larger
  4: 1.1,   // +10% vs 4 sizes larger
};

// ========== CREATURE TYPE ==========

export enum CreatureType {
  // Basic types
  BEAST = 'beast',           // Animals, insects, slimes
  UNDEAD = 'undead',         // Skeletons, zombies, ghosts
  DEMON = 'demon',           // Demons, evil spirits
  DRAGON = 'dragon',         // Dragons, drakes
  ELEMENTAL = 'elemental',   // Fire, ice, lightning elementals
  HUMANOID = 'humanoid',     // Orcs, goblins, humans, elves
  CONSTRUCT = 'construct',   // Golems, robots
  GIANT = 'giant',           // Ogres, trolls
  PLANT = 'plant',           // Mandragoras, venus flytrap
  BUG = 'bug',               // Scorpions, spiders
  
  // Extended types
  SPIRIT = 'spirit',         // Ghosts, wraiths
  MECHANICAL = 'mechanical', // Constructs with gears
  CELESTIAL = 'celestial',   // Angels, gods
  ABERRATION = 'aberration', // Eldritch horrors
}

// ========== CREATURE RANK ==========

export enum CreatureRank {
  NORMAL = 'normal',         // ×1.0 stats
  ELITE = 'elite',           // ×1.5 stats
  MINI_BOSS = 'mini_boss',   // ×2.0 stats
  BOSS = 'boss',             // ×3.0 stats
  WORLD_BOSS = 'world_boss', // ×5.0 stats
  LEGENDARY = 'legendary',   // ×7.0 stats (special)
}

// ========== CREATURE TIER ==========

export enum CreatureTier {
  TIER_1 = 1,  // Very Easy (Level 1-10)
  TIER_2 = 2,  // Easy (Level 11-20)
  TIER_3 = 3,  // Normal (Level 21-30)
  TIER_4 = 4,  // Hard (Level 31-40)
  TIER_5 = 5,  // Very Hard / Boss (Level 41-50)
}

// ========== STAT GROWTH (LEGACY - LINEAR) ==========

export interface CreatureStatGrowth {
  vit: number;       // VIT per level
  hp: number;        // Additional HP per level
  attack: number;    // ATK per level
  defense: number;   // DEF per level
  dex: number;       // DEX per level
  magic: number;     // MAG per level
  mana: number;      // Additional Mana per level
}

// ========== EXPONENTIAL GROWTH RATES ==========
// New system: stat = base * growthRate^(level-1)
// Each creature type has unique growth rates for each stat

export interface CreatureGrowthRates {
  vit: number;      // HP growth per level (e.g., 1.03 = +3%)
  hp: number;       // Additional HP multiplier per level
  attack: number;   // ATK growth per level
  defense: number;  // DEF growth per level
  dex: number;      // DEX growth per level
  magic: number;    // MAG growth per level
  mana: number;     // Mana multiplier per level
}

// ========== COMBAT BONUSES ==========

export interface CreatureCombatBonuses {
  critRate?: number;
  critDamage?: number;
  evasion?: number;
  resistance?: number;
  lifeSteal?: number;
  damageReduction?: number;
}

// ========== CREATURE TYPE TEMPLATE ==========
/**
 * Type Template - Defines base stats for each creature type
 * e.g., BEAST has different base stats than UNDEAD or DRAGON
 */

export interface CreatureTypeTemplate {
  type: CreatureType;
  name: string;
  
  // Base stats at level 1 (before any growth)
  baseHp: number;
  baseVit: number;
  baseAttack: number;
  baseDefense: number;
  baseDex: number;
  baseMagic: number;
  baseMana: number;
  
  // Growth per level - using exponential formula
  // stat = base * growthRate^(level-1)
  growth: CreatureGrowthRates;
  
  // Combat bonuses
  bonuses: CreatureCombatBonuses;
  
  // Type-specific abilities
  abilities: string[];
  
  // Type-specific drops (for monsters)
  drops: string[];
  
  description: string;
}

// ========== CREATURE DROPS ==========

export interface CreatureDrops {
  common: string[];      // 30%+ drop rate
  uncommon: string[];    // 10-30% drop rate
  rare: string[];        // 1-10% drop rate
  legendary: string[];   // <1% drop rate
}

// ========== CREATURE VISUALS ==========

export interface CreatureVisuals {
  sprite: string;        // Sprite path e.g., "slimes/king_slime"
  icon: string;          // Emoji icon e.g., "👑"
  portrait?: string;     // Portrait path e.g., "slimes/portraits/king_slime"
  animation?: string;   // Animation path e.g., "slimes/animations/idle"
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'giant';  // Sprite size for rendering
}

// ========== CREATURE TEMPLATE ==========

export interface CreatureTemplate {
  id: string;
  name: string;
  
  // Classification
  creatureType: CreatureType;
  tier: CreatureTier;
  rank: CreatureRank;
  
  // Element (optional)
  element?: ElementType;
  
  // Equipment (determines attack range, move range, bonuses)
  // Monsters can have weapons just like players
  equipment?: WeaponType[];
  
  // Visual data (optional - for rendering)
  visuals?: CreatureVisuals;
  
  // Traits (special properties that affect combat)
  // e.g., FLY units cannot be attacked by melee
  traits?: UnitTrait[];
  
  // Size category (affects damage calculations)
  // e.g., "small vs large" deals +50% damage
  size?: SizeCategory;
  
  // Base stats at level 1
  baseHp: number;
  baseVit: number;
  baseAttack: number;
  baseDefense: number;
  baseDex: number;
  baseMagic: number;
  baseMana: number;
  
  // Growth per level - using exponential formula
  // stat = base * growthRate^(level-1)
  growth: CreatureGrowthRates;
  
  // Combat bonuses
  critRateBonus: number;
  critDamageBonus: number;
  evasionBonus: number;
  resistanceBonus: number;
  lifeStealBonus?: number;
  
  // Rewards
  baseExpReward: number;
  baseGoldReward: number;
  
  // Drops
  drops: CreatureDrops;
  
  // Abilities
  abilities: string[];
  
  // Description
  description: string;
}

// ========== MULTIPLIERS ==========

export const RANK_MULTIPLIERS: Record<CreatureRank, number> = {
  [CreatureRank.NORMAL]: 1.0,
  [CreatureRank.ELITE]: 1.5,
  [CreatureRank.MINI_BOSS]: 2.0,
  [CreatureRank.BOSS]: 3.0,
  [CreatureRank.WORLD_BOSS]: 5.0,
  [CreatureRank.LEGENDARY]: 7.0,
};

export const TIER_SCALING: Record<CreatureTier, number> = {
  [CreatureTier.TIER_1]: 1.0,
  [CreatureTier.TIER_2]: 1.5,
  [CreatureTier.TIER_3]: 2.5,
  [CreatureTier.TIER_4]: 4.0,
  [CreatureTier.TIER_5]: 6.0,
};
