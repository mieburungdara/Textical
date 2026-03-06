/**
 * Element Template System
 * 
 * Defines elemental types and their relationships.
 * Used for monster elements, skill elements, and damage calculations.
 * 
 * Element Types (7 elements - Balanced):
 * - NEUTRAL: Non-elemental damage (no strengths/weaknesses)
 * - FIRE: Fire damage (beats WIND, weak to WATER)
 * - WATER: Water damage (beats FIRE, weak to EARTH)
 * - EARTH: Earth damage (beats WATER, weak to WIND)
 * - WIND: Wind damage (beats EARTH, weak to FIRE)
 * - LIGHT: Light damage (beats DARK, weak to DARK - equal)
 * - DARK: Dark damage (beats LIGHT, weak to LIGHT - equal)
 * 
 * Balance Philosophy:
 * - Each natural element has 1 strength and 1 weakness
 * - LIGHT and DARK are perfectly balanced (circular)
 * - NEUTRAL has no modifiers
 */

import { Unit } from '../../combat/TickCost.js';

// ========== ELEMENT TYPES ==========

export enum ElementType {
  NEUTRAL = 'neutral',
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  WIND = 'wind',
  LIGHT = 'light',
  DARK = 'dark',
}

export interface ElementData {
  type: ElementType;
  name: string;
  description: string;
  color: string;
  icon: string;
  beats: ElementType | null;        // Element this beats (2x damage)
  weakTo: ElementType | null;      // Element this is weak to (0.5x damage)
}

// ========== ELEMENT STATUS EFFECT INTERFACE ==========

export interface ElementStatusEffect {
  name: string;
  type: 'damage_over_time' | 'heal_over_time' | 'stat_debuff' | 'stat_buff' | 'stun' | 'silence' | 'root' | 'none';
  damage?: number;        // For DoT
  heal?: number;          // For HoT
  statAffected?: string;  // For stat debuffs/buffs
  statValue?: number;     // Percentage or flat value
  duration: number;       // In ticks
  tickInterval: number;  // Apply every X ticks
}

// ========== ELEMENT TEMPLATE INTERFACE ==========

export interface ElementTemplate {
  id: string;
  name: string;
  type: ElementType;
  icon: string;
  color: string;
  
  // Elemental relationships (from templates/)
  beats: ElementType | null;      // Element this beats (2x damage)
  weakTo: ElementType | null;    // Element this is weak to (0.5x damage)
  
  // Combat effects
  statusEffect: ElementStatusEffect;
  
  // Visual/Audio
  particleEffect?: string;
  soundEffect?: string;
  
  // Flavor
  description: string;
}

// ========== ELEMENT RELATIONSHIPS (BALANCED) ==========

/**
 * Element effectiveness chart (Balanced Rock-Paper-Scissors)
 * 
 * Each element:
 * - Beats 1 element (2x damage)
 * - Is weak to 1 element (0.5x damage)
 * - Resistant to same element (0.5x damage)
 * - Neutral to other elements (1x damage)
 * 
 * Cycle: FIRE > WIND > EARTH > WATER > FIRE
 *        LIGHT <> DARK (equal)
 */
export const ELEMENT_EFFECTIVENESS: Record<ElementType, Partial<Record<ElementType, number>>> = {
  // FIRE: Beats WIND, Weak to WATER
  [ElementType.FIRE]: {
    [ElementType.WIND]: 2.0,
    [ElementType.WATER]: 0.5,
    [ElementType.FIRE]: 0.5,
  },
  // WIND: Beats EARTH, Weak to FIRE
  [ElementType.WIND]: {
    [ElementType.EARTH]: 2.0,
    [ElementType.FIRE]: 0.5,
    [ElementType.WIND]: 0.5,
  },
  // EARTH: Beats WATER, Weak to WIND
  [ElementType.EARTH]: {
    [ElementType.WATER]: 2.0,
    [ElementType.WIND]: 0.5,
    [ElementType.EARTH]: 0.5,
  },
  // WATER: Beats FIRE, Weak to EARTH
  [ElementType.WATER]: {
    [ElementType.FIRE]: 2.0,
    [ElementType.EARTH]: 0.5,
    [ElementType.WATER]: 0.5,
  },
  // LIGHT: Beats DARK (1.5x)
  [ElementType.LIGHT]: {
    [ElementType.DARK]: 1.5,
    [ElementType.LIGHT]: 0.5,
  },
  // DARK: Beats LIGHT (1.5x)
  [ElementType.DARK]: {
    [ElementType.LIGHT]: 1.5,
    [ElementType.DARK]: 0.5,
  },
  // NEUTRAL: No modifiers
  [ElementType.NEUTRAL]: {},
};

// ========== CALCULATION FUNCTIONS ==========

/**
 * Calculate elemental damage multiplier
 * @param attackElement The element of the attack
 * @param defendElement The element of the defender
 * @returns Damage multiplier (0 = immune, 0.5 = resistant, 1 = normal, 2 = super effective)
 */
export function calculateElementalMultiplier(
  attackElement: ElementType,
  defendElement: ElementType
): number {
  // Neutral has no effect
  if (attackElement === ElementType.NEUTRAL || defendElement === ElementType.NEUTRAL) {
    return 1.0;
  }
  
  const effectiveness = ELEMENT_EFFECTIVENESS[attackElement];
  return effectiveness[defendElement] ?? 1.0;
}

/**
 * Calculate elemental damage
 */
export function calculateElementalDamage(
  baseDamage: number,
  attackElement: ElementType,
  defendElement: ElementType
): number {
  const multiplier = calculateElementalMultiplier(attackElement, defendElement);
  return Math.floor(baseDamage * multiplier);
}

/**
 * Check if attack is super effective (2x damage)
 */
export function isSuperEffective(attackElement: ElementType, defendElement: ElementType): boolean {
  return calculateElementalMultiplier(attackElement, defendElement) >= 2.0;
}

/**
 * Check if attack is not very effective (0.5x damage)
 */
export function isNotVeryEffective(attackElement: ElementType, defendElement: ElementType): boolean {
  return calculateElementalMultiplier(attackElement, defendElement) < 1.0;
}

/**
 * Check if attack is immune (0 damage)
 */
export function isImmune(attackElement: ElementType, defendElement: ElementType): boolean {
  return calculateElementalMultiplier(attackElement, defendElement) === 0.0;
}

/**
 * Get element by name (case-insensitive)
 */
export function getElementByName(name: string): ElementType | undefined {
  const normalized = name.toLowerCase() as ElementType;
  return Object.values(ElementType).find(e => e === normalized);
}

/**
 * Get what element beats the target (for display)
 */
export function getElementStrength(element: ElementType): ElementType | null {
  // Find which element has this element as weakTo
  for (const attacker of Object.values(ElementType)) {
    const effectiveness = ELEMENT_EFFECTIVENESS[attacker];
    if (effectiveness && effectiveness[element] !== undefined && effectiveness[element] >= 2.0) {
      return attacker;
    }
  }
  return null;
}

/**
 * Get what element the target is weak to (for display)
 */
export function getElementWeakness(element: ElementType): ElementType | null {
  const effectiveness = ELEMENT_EFFECTIVENESS[element];
  if (!effectiveness) return null;
  
  // Find which element this element is weak to (0.5x)
  for (const defender of Object.values(ElementType)) {
    if (effectiveness[defender] === 0.5 && defender !== element) {
      return defender;
    }
  }
  return null;
}
