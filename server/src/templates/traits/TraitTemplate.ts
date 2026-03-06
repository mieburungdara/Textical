/**
 * Trait Template System
 * 
 * Defines templates for unit traits that automatically apply bonuses.
 * Instead of hardcoding trait effects in factory, each trait has its own template.
 * 
 * Usage: Add trait to creature's traits[] array → bonuses automatically applied
 */

import { UnitTrait } from '../creatures/CreatureBase.js';

// ========== TRAIT STAT BONUSES ==========

export interface TraitStatBonuses {
  // Primary stat bonuses
  attackBonus?: number;
  defenseBonus?: number;
  vitBonus?: number;
  dexBonus?: number;
  magicBonus?: number;
  
  // Secondary stat bonuses
  critRateBonus?: number;
  critDamageBonus?: number;
  evasionBonus?: number;
  resistanceBonus?: number;
  lifeStealBonus?: number;
  spellVampBonus?: number;
  damageReductionBonus?: number;
  statusResistanceBonus?: number;
  blockBonus?: number;
  accuracyBonus?: number;
  
  // HP/Mana bonuses
  hpBonus?: number;
  manaBonus?: number;
}

// ========== TRAIT IMMUNITIES ==========

export interface TraitImmunities {
  melee?: boolean;        // Immune to melee attacks (e.g., FLY vs ground melee)
  poison?: boolean;       // Immune to poison
  fire?: boolean;         // Immune to fire
  ice?: boolean;          // Immune to ice
  lightning?: boolean;    // Immune to lightning
  physical?: boolean;     // Immune to physical damage (GHOST)
  magic?: boolean;        // Immune to magic
  mind?: boolean;         // Immune to mind effects
  critical?: boolean;     // Cannot be critically hit
  debuffs?: boolean;      // Immune to all debuffs
}

// ========== TRAIT COMBAT EFFECTS ==========

export interface TraitCombatEffects {
  // Damage modifiers
  damageVsUndead?: number;      // Bonus damage vs undead (e.g., holy)
  damageVsDemon?: number;       // Bonus damage vs demons
  damageVsBeast?: number;       // Bonus damage vs beasts
  damageVsDragon?: number;       // Bonus damage vs dragons
  
  // Healing modifiers
  healingReceived?: number;      // Modifier to healing received (e.g., undead heal = 50%)
  
  // Special abilities
  canFly?: boolean;             // Can fly over obstacles
  canSwim?: boolean;            // Can swim
  burrow?: boolean;             // Can move underground
  
  // Threat/Aggro
  threatMultiplier?: number;    // Threat generation multiplier (BOSS = 2x)
  
  // Regeneration
  passiveRegen?: number;         // Passive HP regen per tick
  passiveManaRegen?: number;   // Passive mana regen per tick
}

// ========== TRAIT CATEGORY ==========

export enum TraitCategory {
  COMBAT = 'combat',     // Combat-related traits (fly, undead, boss)
  SPECIAL = 'special',   // Special traits (elite, legendary)
  ELEMENTAL = 'elemental', // Elemental traits (fire_immunity, etc)
  BEHAVIOR = 'behavior', // Behavioral traits (passive, aggressive)
}

// ========== TRAIT TEMPLATE ==========

export interface TraitTemplate {
  // Identification
  id: UnitTrait;
  name: string;
  description: string;
  
  // Category for organization
  category: TraitCategory;
  
  // Auto-applied stat bonuses when unit has this trait
  statBonuses?: TraitStatBonuses;
  
  // Combat immunities
  immunities?: TraitImmunities;
  
  // Special combat effects
  combatEffects?: TraitCombatEffects;
  
  // Visual/UI
  icon?: string;
  color?: string;
  
  // Rarity for UI display
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // Stackable? (most traits are not)
  stackable?: boolean;
  maxStacks?: number;
}

// ========== FACTORY FUNCTION TYPE ==========

export type TraitBonusCalculator = (trait: UnitTrait, baseStats: Partial<TraitStatBonuses>) => TraitStatBonuses;
