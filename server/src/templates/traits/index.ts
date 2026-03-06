/**
 * Trait Templates Index
 * 
 * Central export for all trait templates.
 * Provides helper functions to get trait bonuses.
 */

import { UnitTrait } from '../creatures/CreatureBase.js';
import { TraitTemplate, TraitStatBonuses, TraitImmunities, TraitCombatEffects, TraitCategory } from './TraitTemplate.js';

// Combat traits
export { FLY_TRAIT } from './combat/flying.js';
export { UNDEAD_TRAIT } from './combat/undead.js';
export { BOSS_TRAIT } from './combat/boss.js';
export { MINI_BOSS_TRAIT } from './combat/mini_boss.js';
export { GHOST_TRAIT } from './combat/ghost.js';
export { MECHANICAL_TRAIT } from './combat/mechanical.js';
export { AQUATIC_TRAIT } from './combat/aquatic.js';
export { BURROW_TRAIT } from './combat/burrow.js';
export { CONSTRUCT_TRAIT } from './combat/construct.js';
export { VAMPIRE_TRAIT } from './combat/vampire.js';
export { ARCANE_TRAIT } from './combat/arcane.js';

// Special traits
export { ELITE_TRAIT } from './special/elite.js';
export { LEGENDARY_TRAIT } from './special/legendary.js';

// Re-export types
export { TraitTemplate, TraitStatBonuses, TraitImmunities, TraitCombatEffects, TraitCategory } from './TraitTemplate.js';

// ========== TRAIT REGISTRY ==========

/**
 * All trait templates indexed by UnitTrait
 */
export const TRAIT_TEMPLATES: Record<UnitTrait, TraitTemplate> = {
  [UnitTrait.FLY]: {
    id: UnitTrait.FLY,
    name: 'Flying',
    description: 'Immune to melee attacks from ground units. Can fly over obstacles.',
    category: TraitCategory.COMBAT,
    statBonuses: { evasionBonus: 5, dexBonus: 2 },
    immunities: { melee: true },
    combatEffects: { canFly: true },
    icon: '🦇',
    color: '#4A90D9',
    rarity: 'uncommon',
  },
  [UnitTrait.AQUATIC]: {
    id: UnitTrait.AQUATIC,
    name: 'Aquatic',
    description: 'Can swim in water. Weak to lightning attacks.',
    category: TraitCategory.COMBAT,
    statBonuses: { defenseBonus: 3, evasionBonus: 3 },
    combatEffects: { canSwim: true },
    icon: '🐟',
    color: '#00CED1',
    rarity: 'common',
  },
  [UnitTrait.BURROW]: {
    id: UnitTrait.BURROW,
    name: 'Burrow',
    description: 'Can move underground. Can surprise attack from below.',
    category: TraitCategory.COMBAT,
    statBonuses: { attackBonus: 5, evasionBonus: 10 },
    combatEffects: { burrow: true },
    icon: '🕳️',
    color: '#8B4513',
    rarity: 'uncommon',
  },
  [UnitTrait.GHOST]: {
    id: UnitTrait.GHOST,
    name: 'Ghost',
    description: 'Immune to physical damage. Can phase through solid objects.',
    category: TraitCategory.COMBAT,
    statBonuses: { evasionBonus: 15, magicBonus: 5 },
    immunities: { physical: true },
    icon: '👻',
    color: '#9370DB',
    rarity: 'rare',
  },
  [UnitTrait.MECHANICAL]: {
    id: UnitTrait.MECHANICAL,
    name: 'Mechanical',
    description: 'Immune to poison and mind effects. Cannot be healed normally.',
    category: TraitCategory.COMBAT,
    statBonuses: { defenseBonus: 8, resistanceBonus: 10 },
    immunities: { poison: true, mind: true },
    icon: '⚙️',
    color: '#708090',
    rarity: 'uncommon',
  },
  [UnitTrait.UNDEAD]: {
    id: UnitTrait.UNDEAD,
    name: 'Undead',
    description: 'Immune to poison. Receives 50% healing from normal sources.',
    category: TraitCategory.COMBAT,
    statBonuses: { resistanceBonus: 5, damageReductionBonus: 2 },
    immunities: { poison: true },
    combatEffects: { healingReceived: 0.5, passiveRegen: 1 },
    icon: '💀',
    color: '#2E8B57',
    rarity: 'common',
  },
  [UnitTrait.CONSTRUCT]: {
    id: UnitTrait.CONSTRUCT,
    name: 'Construct',
    description: 'Immune to mind effects. Cannot be healed - must be repaired.',
    category: TraitCategory.COMBAT,
    statBonuses: { defenseBonus: 10, damageReductionBonus: 5 },
    immunities: { mind: true },
    icon: '🗿',
    color: '#A9A9A9',
    rarity: 'uncommon',
  },
  [UnitTrait.BOSS]: {
    id: UnitTrait.BOSS,
    name: 'Boss',
    description: 'Cannot be bypassed. Generates 2x threat. Increased rewards on defeat.',
    category: TraitCategory.COMBAT,
    statBonuses: { attackBonus: 10, defenseBonus: 10, resistanceBonus: 15, statusResistanceBonus: 50 },
    combatEffects: { threatMultiplier: 2.0 },
    icon: '👹',
    color: '#FF4500',
    rarity: 'epic',
  },
  [UnitTrait.ELITE]: {
    id: UnitTrait.ELITE,
    name: 'Elite',
    description: 'Stronger than normal units. 1.5x stats and increased threat.',
    category: TraitCategory.SPECIAL,
    statBonuses: { attackBonus: 8, defenseBonus: 6, critRateBonus: 3, evasionBonus: 3 },
    combatEffects: { threatMultiplier: 1.3 },
    icon: '⭐',
    color: '#FFD700',
    rarity: 'uncommon',
  },
  [UnitTrait.MINI_BOSS]: {
    id: UnitTrait.MINI_BOSS,
    name: 'Mini Boss',
    description: 'Generates 1.5x threat. Stronger than normal enemies.',
    category: TraitCategory.COMBAT,
    statBonuses: { attackBonus: 5, defenseBonus: 5, resistanceBonus: 8, statusResistanceBonus: 25 },
    combatEffects: { threatMultiplier: 1.5 },
    icon: '💢',
    color: '#FF6347',
    rarity: 'rare',
  },
  [UnitTrait.VAMPIRE]: {
    id: UnitTrait.VAMPIRE,
    name: 'Vampire',
    description: 'Drains life from enemies on attack. Gains lifeSteal based on damage dealt.',
    category: TraitCategory.COMBAT,
    statBonuses: { lifeStealBonus: 10, attackBonus: 2 },
    combatEffects: { healingReceived: 0.5 },
    icon: '🧛',
    color: '#8B0000',
    rarity: 'rare',
  },
  [UnitTrait.ARCANE]: {
    id: UnitTrait.ARCANE,
    name: 'Arcane',
    description: 'Absorbs magical energy. Gains spellVamp from spell damage dealt.',
    category: TraitCategory.COMBAT,
    statBonuses: { spellVampBonus: 10, magicBonus: 5 },
    icon: '✨',
    color: '#9400D3',
    rarity: 'rare',
  },
  [UnitTrait.LEGENDARY]: {
    id: UnitTrait.LEGENDARY,
    name: 'Legendary',
    description: 'The strongest of its kind. 2x stats, 3x threat, and 50% damage reduction.',
    category: TraitCategory.SPECIAL,
    statBonuses: { attackBonus: 15, defenseBonus: 15, critRateBonus: 10, critDamageBonus: 0.5, evasionBonus: 10, resistanceBonus: 20, damageReductionBonus: 10 },
    combatEffects: { threatMultiplier: 3.0 },
    icon: '🏆',
    color: '#FF8C00',
    rarity: 'legendary',
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get a trait template by UnitTrait enum
 */
export function getTraitTemplate(trait: UnitTrait): TraitTemplate | undefined {
  return TRAIT_TEMPLATES[trait];
}

/**
 * Get stat bonuses from a list of traits
 * Combines all trait bonuses into one stat bonuses object
 */
export function getTraitStatBonuses(traits: UnitTrait[]): TraitStatBonuses {
  const combined: TraitStatBonuses = {};
  
  for (const trait of traits) {
    const template = getTraitTemplate(trait);
    if (template?.statBonuses) {
      // Merge each stat bonus
      const bonuses = template.statBonuses;
      
      if (bonuses.attackBonus) combined.attackBonus = (combined.attackBonus ?? 0) + bonuses.attackBonus;
      if (bonuses.defenseBonus) combined.defenseBonus = (combined.defenseBonus ?? 0) + bonuses.defenseBonus;
      if (bonuses.vitBonus) combined.vitBonus = (combined.vitBonus ?? 0) + bonuses.vitBonus;
      if (bonuses.dexBonus) combined.dexBonus = (combined.dexBonus ?? 0) + bonuses.dexBonus;
      if (bonuses.magicBonus) combined.magicBonus = (combined.magicBonus ?? 0) + bonuses.magicBonus;
      if (bonuses.critRateBonus) combined.critRateBonus = (combined.critRateBonus ?? 0) + bonuses.critRateBonus;
      if (bonuses.critDamageBonus) combined.critDamageBonus = (combined.critDamageBonus ?? 0) + bonuses.critDamageBonus;
      if (bonuses.evasionBonus) combined.evasionBonus = (combined.evasionBonus ?? 0) + bonuses.evasionBonus;
      if (bonuses.resistanceBonus) combined.resistanceBonus = (combined.resistanceBonus ?? 0) + bonuses.resistanceBonus;
      if (bonuses.lifeStealBonus) combined.lifeStealBonus = (combined.lifeStealBonus ?? 0) + bonuses.lifeStealBonus;
      if (bonuses.spellVampBonus) combined.spellVampBonus = (combined.spellVampBonus ?? 0) + bonuses.spellVampBonus;
      if (bonuses.damageReductionBonus) combined.damageReductionBonus = (combined.damageReductionBonus ?? 0) + bonuses.damageReductionBonus;
      if (bonuses.statusResistanceBonus) combined.statusResistanceBonus = (combined.statusResistanceBonus ?? 0) + bonuses.statusResistanceBonus;
      if (bonuses.blockBonus) combined.blockBonus = (combined.blockBonus ?? 0) + bonuses.blockBonus;
      if (bonuses.accuracyBonus) combined.accuracyBonus = (combined.accuracyBonus ?? 0) + bonuses.accuracyBonus;
      if (bonuses.hpBonus) combined.hpBonus = (combined.hpBonus ?? 0) + bonuses.hpBonus;
      if (bonuses.manaBonus) combined.manaBonus = (combined.manaBonus ?? 0) + bonuses.manaBonus;
    }
  }
  
  return combined;
}

/**
 * Get all immunities from a list of traits
 */
export function getTraitImmunities(traits: UnitTrait[]): TraitImmunities {
  const combined: TraitImmunities = {};
  
  for (const trait of traits) {
    const template = getTraitTemplate(trait);
    if (template?.immunities) {
      Object.assign(combined, template.immunities);
    }
  }
  
  return combined;
}

/**
 * Get all combat effects from a list of traits
 * For values that multiply (threatMultiplier), returns the highest
 * For values that add (passiveRegen), sums them
 */
export function getTraitCombatEffects(traits: UnitTrait[]): TraitCombatEffects {
  const combined: TraitCombatEffects = {};
  
  for (const trait of traits) {
    const template = getTraitTemplate(trait);
    if (template?.combatEffects) {
      const effects = template.combatEffects;
      
      // For multipliers, use the highest value
      if (effects.threatMultiplier !== undefined) {
        combined.threatMultiplier = Math.max(combined.threatMultiplier ?? 1, effects.threatMultiplier);
      }
      
      // For additive values, sum them
      if (effects.passiveRegen) combined.passiveRegen = (combined.passiveRegen ?? 0) + effects.passiveRegen;
      if (effects.passiveManaRegen) combined.passiveManaRegen = (combined.passiveManaRegen ?? 0) + effects.passiveManaRegen;
      if (effects.healingReceived !== undefined) combined.healingReceived = effects.healingReceived; // Use lowest (worst for unit)
      
      // For booleans, just mark as true if any trait has it
      if (effects.canFly) combined.canFly = true;
      if (effects.canSwim) combined.canSwim = true;
      if (effects.burrow) combined.burrow = true;
    }
  }
  
  return combined;
}

/**
 * Check if a unit with given traits is immune to a specific type
 */
export function isImmuneTo(traits: UnitTrait[], immunityType: keyof TraitImmunities): boolean {
  const immunities = getTraitImmunities(traits);
  return immunities[immunityType] ?? false;
}

/**
 * Check if unit is immune to melee attacks (flying unit vs ground melee)
 */
export function isImmuneToMelee(traits: UnitTrait[]): boolean {
  return isImmuneTo(traits, 'melee');
}

/**
 * Check if unit is immune to poison
 */
export function isImmuneToPoison(traits: UnitTrait[]): boolean {
  return isImmuneTo(traits, 'poison');
}

/**
 * Check if unit is immune to physical damage
 */
export function isImmuneToPhysical(traits: UnitTrait[]): boolean {
  return isImmuneTo(traits, 'physical');
}
