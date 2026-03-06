/**
 * Elemental Resistance System
 * 
 * Defines how units resist elemental damage.
 * Each unit can have resistance values for each element type.
 * 
 * Resistance Values:
 * - Negative: Absorption (heals instead of damage)
 * - Zero: Normal damage
 * - Positive: Damage reduction
 * - 100: Immunity
 */

import { Unit } from '../../combat/TickCost.js';
import { ElementType, calculateElementalMultiplier } from './Element.js';

// ========== RESISTANCE LIMITS ==========

export const ELEMENTAL_RESISTANCE_LIMITS = {
  MIN: -50,    // Absorption (heals for 50% of damage)
  MAX: 100,    // Immunity (takes 0 damage)
};

// ========== RESISTANCE INTERFACE ==========

export interface ElementalResistance {
  [ElementType.NEUTRAL]: number;
  [ElementType.FIRE]: number;
  [ElementType.WATER]: number;
  [ElementType.EARTH]: number;
  [ElementType.WIND]: number;
  [ElementType.LIGHT]: number;
  [ElementType.DARK]: number;
}

// ========== DEFAULT RESISTANCE ==========

export const DEFAULT_ELEMENTAL_RESISTANCE: ElementalResistance = {
  [ElementType.NEUTRAL]: 0,
  [ElementType.FIRE]: 0,
  [ElementType.WATER]: 0,
  [ElementType.EARTH]: 0,
  [ElementType.WIND]: 0,
  [ElementType.LIGHT]: 0,
  [ElementType.DARK]: 0,
};

// ========== FACTORY FUNCTIONS ==========

/**
 * Create elemental resistance with custom values
 */
export function createElementalResistance(
  overrides: Partial<ElementalResistance> = {}
): ElementalResistance {
  return {
    ...DEFAULT_ELEMENTAL_RESISTANCE,
    ...overrides,
  };
}

/**
 * Create uniform resistance for all elements
 */
export function createUniformResistance(value: number): ElementalResistance {
  const clampedValue = Math.max(
    ELEMENTAL_RESISTANCE_LIMITS.MIN,
    Math.min(ELEMENTAL_RESISTANCE_LIMITS.MAX, value)
  );
  
  return {
    [ElementType.NEUTRAL]: clampedValue,
    [ElementType.FIRE]: clampedValue,
    [ElementType.WATER]: clampedValue,
    [ElementType.EARTH]: clampedValue,
    [ElementType.WIND]: clampedValue,
    [ElementType.LIGHT]: clampedValue,
    [ElementType.DARK]: clampedValue,
  };
}

// ========== RESISTANCE CALCULATIONS ==========

/**
 * Calculate damage after elemental resistance
 */
export function calculateElementalResistanceDamage(
  baseDamage: number,
  attackElement: ElementType,
  resistance: number
): number {
  const clampedResistance = Math.max(
    ELEMENTAL_RESISTANCE_LIMITS.MIN,
    Math.min(ELEMENTAL_RESISTANCE_LIMITS.MAX, resistance)
  );
  
  const damageMultiplier = 1 - (clampedResistance / 100);
  return Math.floor(baseDamage * damageMultiplier);
}

/**
 * Calculate total damage with element effectiveness + resistance
 */
export function calculateElementalTotalDamage(
  baseDamage: number,
  attackElement: ElementType,
  defenseElement: ElementType,
  resistance: number
): number {
  const elementalMultiplier = calculateElementalMultiplier(attackElement, defenseElement);
  const afterElement = baseDamage * elementalMultiplier;
  return calculateElementalResistanceDamage(afterElement, attackElement, resistance);
}

// ========== UNIT EXTENSION ==========

export function addElementalResistanceToUnit(
  unit: Unit,
  resistance: ElementalResistance
): void {
  (unit as any).elementalResistance = resistance;
}

export function getElementalResistanceFromUnit(unit: Unit): ElementalResistance {
  return (unit as any).elementalResistance ?? DEFAULT_ELEMENTAL_RESISTANCE;
}

// ========== RESISTANCE BONUS INTERFACE ==========

export interface ElementalResistanceBonus {
  neutral?: number;
  fire?: number;
  water?: number;
  earth?: number;
  wind?: number;
  light?: number;
  dark?: number;
}

/**
 * Add resistance bonuses together
 */
export function addElementalResistance(
  base: ElementalResistance,
  bonus: ElementalResistanceBonus
): ElementalResistance {
  const add = (current: number, bonusValue: number | undefined) => {
    return Math.max(
      ELEMENTAL_RESISTANCE_LIMITS.MIN,
      Math.min(ELEMENTAL_RESISTANCE_LIMITS.MAX, current + (bonusValue ?? 0))
    );
  };
  
  return {
    [ElementType.NEUTRAL]: add(base[ElementType.NEUTRAL], bonus.neutral),
    [ElementType.FIRE]: add(base[ElementType.FIRE], bonus.fire),
    [ElementType.WATER]: add(base[ElementType.WATER], bonus.water),
    [ElementType.EARTH]: add(base[ElementType.EARTH], bonus.earth),
    [ElementType.WIND]: add(base[ElementType.WIND], bonus.wind),
    [ElementType.LIGHT]: add(base[ElementType.LIGHT], bonus.light),
    [ElementType.DARK]: add(base[ElementType.DARK], bonus.dark),
  };
}

// ========== RACE-BASED RESISTANCE (BALANCED) ==========

/**
 * Get natural resistances by monster/race type
 * Each race has balanced strengths and weaknesses
 */
export function getRaceElementalResistance(monsterType: string): ElementalResistance {
  const resistances: Record<string, ElementalResistance> = {
    // Fire creatures: Resistant to Fire, Weak to Water
    fire: createElementalResistance({
      [ElementType.FIRE]: 25,
      [ElementType.WATER]: -25,
    }),
    
    // Water creatures: Resistant to Water, Weak to Earth
    water: createElementalResistance({
      [ElementType.WATER]: 25,
      [ElementType.EARTH]: -25,
    }),
    
    // Earth creatures: Resistant to Earth, Weak to Wind
    earth: createElementalResistance({
      [ElementType.EARTH]: 25,
      [ElementType.WIND]: -25,
    }),
    
    // Wind creatures: Resistant to Wind, Weak to Fire
    wind: createElementalResistance({
      [ElementType.WIND]: 25,
      [ElementType.FIRE]: -25,
    }),
    
    // Undead: Resistant to Dark, Weak to Light
    undead: createElementalResistance({
      [ElementType.DARK]: 25,
      [ElementType.LIGHT]: -25,
    }),
    
    // Demons: Resistant to Dark, Weak to Light
    demon: createElementalResistance({
      [ElementType.DARK]: 25,
      [ElementType.LIGHT]: -25,
    }),
    
    // Dragons: Resistant to Fire
    dragon: createElementalResistance({
      [ElementType.FIRE]: 50,
    }),
    
    // Constructs: Resistant to Physical/Neutral
    construct: createElementalResistance({
      [ElementType.EARTH]: 10,
    }),
    
    // Plants: Resistant to Water, Weak to Fire
    plant: createElementalResistance({
      [ElementType.WATER]: 25,
      [ElementType.FIRE]: -25,
    }),
    
    // Default: No resistance
    default: DEFAULT_ELEMENTAL_RESISTANCE,
  };
  
  return resistances[monsterType.toLowerCase()] ?? resistances.default;
}

// ========== DAMAGE TYPE FLAGS ==========

export interface DamageTypeFlags {
  isPhysical: boolean;
  isMagical: boolean;
  isElemental: boolean;
  element?: ElementType;
}

export function getDamageTypeFlags(
  isPhysical: boolean,
  element: ElementType
): DamageTypeFlags {
  return {
    isPhysical,
    isMagical: !isPhysical,
    isElemental: element !== ElementType.NEUTRAL,
    element,
  };
}
