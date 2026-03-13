/**
 * Status Effect Template System
 * 
 * Defines status effects that can be applied to units during combat.
 * Status effects can come from:
 * - Element attacks (Burn, Wet, Heavy, Bleed, Blind, Curse)
 * - Skills (Poison, Stun, Freeze, etc.)
 * - Items or environmental effects
 * 
 * Each status effect has:
 * - Type: DoT, HoT, stat buff/debuff, control effect
 * - Duration: How long it lasts in ticks
 * - Tick interval: How often it triggers
 * - Stack behavior: Can it stack with same effect?
 * 
 * Pattern:
 * - Base interface in StatusEffect.ts
 * - Individual templates in separate files (burn.ts, stun.ts, etc.)
 * - index.ts as registry
 */

import { Unit } from '../../combat/TickCost.js';

// ========== STATUS EFFECT TYPES ==========

export enum StatusEffectType {
  // Damage/Heal over time
  DAMAGE_OVER_TIME = 'damage_over_time',
  HEAL_OVER_TIME = 'heal_over_time',
  
  // Stat modifications
  STAT_BUFF = 'stat_buff',
  STAT_DEBUFF = 'stat_debuff',
  
  // Control effects
  STUN = 'stun',
  FREEZE = 'freeze',
  SLEEP = 'sleep',
  SILENCE = 'silence',
  ROOT = 'root',
  
  // Special
  INVULNERABLE = 'invulnerable',
  REFLECT = 'reflect',
  SHIELD = 'shield',
  INVISIBLE = 'invisible',       // Cannot be targeted, but CAN take AOE damage
  PHASED = 'phased',             // Can pass through enemies, but CAN take damage
}

export enum StatusEffectCategory {
  DOT = 'damage_over_time',      // Damage over time (Burn, Bleed, Poison)
  HOT = 'heal_over_time',        // Heal over time (Regen)
  DEBUFF = 'debuff',            // Stat debuffs (Wet, Heavy, Blind, Curse)
  BUFF = 'buff',                // Stat buffs (Haste, Shield)
  CONTROL = 'control',          // Stun, Freeze, Sleep, Silence, Root
  SPECIAL = 'special',          // Invulnerable, Reflect, etc.
}

export enum StatAffected {
  HP = 'hp',
  MANA = 'mana',
  SPEED = 'speed',
  ATK = 'atk',
  DEF = 'def',
  VIT = 'vit',
  MAG = 'mag',
  DEX = 'dex',
  ACCURACY = 'accuracy',
  EVASION = 'evasion',
  CRIT_RATE = 'critRate',
  CRIT_DAMAGE = 'critDamage',
  RESISTANCE = 'resistance',
  BLOCK = 'block',
  HEALING = 'healing',
}

// ========== STATUS EFFECT STACK BEHAVIOR ==========

export enum StackBehavior {
  NONE = 'none',           // Cannot stack, refreshes duration
  INTENSITY = 'intensity', // Stacks intensity (damage/heal amount)
  DURATION = 'duration',  // Stacks duration
  INDEPENDENT = 'independent', // Each instance is independent
}

// ========== STATUS EFFECT DATA INTERFACE ==========

export interface StatusEffectData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  
  // Type and category
  type: StatusEffectType;
  category: StatusEffectCategory;
  
  // Effect values
  damage?: number;        // For DoT - damage per tick
  heal?: number;          // For HoT - heal per tick
  statAffected?: StatAffected;  // For stat modifications
  statValue?: number;     // Percentage change (negative for debuff)
  
  // Duration and timing
  duration: number;       // Total duration in ticks
  tickInterval: number;   // Apply effect every X ticks (1 = every tick)
  
  // Stacking
  stackBehavior: StackBehavior;
  maxStacks?: number;     // Maximum number of stacks (for intensity/duration)
  
  // Control effect flags
  preventsAction?: boolean;    // Unit cannot act (stun, freeze, sleep)
  preventsCast?: boolean;      // Unit cannot use magic/skills (silence)
  preventsMovement?: boolean; // Unit cannot move (root)
  preventsBeingAttacked?: boolean; // Unit cannot be attacked at all (FREEZE only)
  
  // Targeting flags (for INVISIBLE/PHASED)
  preventsTargeting?: boolean;  // Unit cannot be targeted by enemies (INVISIBLE - but CAN take AOE damage)
  allowsPassThrough?: boolean; // Unit can pass through enemies (PHASED)
  completelyImmune?: boolean;  // Unit takes NO damage at all (FREEZE - ice shield)
  // NOTE: preventsTargeting/allowsPassThrough - unit CAN still take damage from AOE/skills
  // NOTE: completelyImmune - unit takes NO damage whatsoever (even DoT, AOE, anything)
  
  // Visual/Audio
  particleEffect?: string;
  soundEffect?: string;
  
  // Source
  sourceElement?: string;     // If from element attack
  sourceSkill?: string;       // If from skill
}

// ========== STATUS EFFECT INSTANCE (Applied to Unit) ==========

export interface StatusEffectInstance {
  id: string;                    // Unique instance ID
  templateId: string;            // Reference to template
  name: string;                 // Effect name (from template)
  type: string;                 // Effect type (from template, for CombatSimulator compatibility)
  value?: number;               // Effect value (damage/heal amount)
  duration: number;             // Total duration (from template)
  remainingDuration: number;     // Ticks remaining
  tickCounter: number;           // Current tick counter
  tickInterval: number;          // Apply every X ticks
  tickApplied: number;           // When effect was applied (for CombatSimulator)
  stacks: number;                // Number of stacks
  appliedAt: number;             // Timestamp when applied
  sourceUnitId?: string;         // Who applied this effect
}

// ========== STATUS EFFECT TEMPLATE INTERFACE ==========

export interface StatusEffectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  
  type: StatusEffectType;
  category: StatusEffectCategory;
  
  // Effect specifics
  damage?: number;
  heal?: number;
  statAffected?: StatAffected;
  statValue?: number;
  
  // Timing
  duration: number;
  tickInterval: number;
  
  // Stacking
  stackBehavior: StackBehavior;
  maxStacks?: number;
  
  // Flags
  preventsAction?: boolean;
  preventsCast?: boolean;
  preventsMovement?: boolean;
  preventsBeingAttacked?: boolean; // Cannot be attacked (FREEZE only)
  preventsTargeting?: boolean;  // Cannot be targeted
  allowsPassThrough?: boolean;  // Can pass through enemies
  completelyImmune?: boolean;   // Takes NO damage at all (FREEZE)
  
  // Assets
  particleEffect?: string;
  soundEffect?: string;
  
  // Source tracking
  sourceElement?: string;
  sourceSkill?: string;
}

// ========== STATUS EFFECT MANAGEMENT FUNCTIONS ==========

/**
 * Create a status effect instance from template
 */
export function createStatusEffectInstance(
  template: StatusEffectTemplate,
  sourceUnitId?: string
): StatusEffectInstance {
  return {
    id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    name: template.name,
    type: template.type,
    value: template.damage ?? template.heal ?? template.statValue,
    duration: template.duration,
    remainingDuration: template.duration,
    tickCounter: 0,
    tickInterval: template.tickInterval,
    tickApplied: Date.now(),
    stacks: 1,
    appliedAt: Date.now(),
    sourceUnitId,
  };
}

/**
 * Apply status effect to a unit
 */
export function applyStatusEffect(
  unit: Unit,
  template: StatusEffectTemplate,
  sourceUnitId?: string
): StatusEffectInstance {
  const instance = createStatusEffectInstance(template, sourceUnitId);
  
  // Check if unit already has this status
  const existingIndex = unit.statusEffects?.findIndex(
    e => e.templateId === template.id
  );
  
  if (existingIndex !== undefined && existingIndex >= 0) {
    const existing = unit.statusEffects![existingIndex];
    
    switch (template.stackBehavior) {
      case StackBehavior.NONE:
        // Refresh duration only
        existing.remainingDuration = template.duration;
        return existing;
        
      case StackBehavior.INTENSITY:
        // Increase stacks, cap at max
        existing.stacks = Math.min(
          existing.stacks + 1,
          template.maxStacks ?? 10
        );
        existing.remainingDuration = template.duration;
        return existing;
        
      case StackBehavior.DURATION:
        // Add to duration, cap at some max
        existing.remainingDuration = Math.min(
          existing.remainingDuration + template.duration,
          (template.maxStacks ?? 10) * template.duration
        );
        return existing;
        
      case StackBehavior.INDEPENDENT:
        // Add as new independent instance
        if (!unit.statusEffects) unit.statusEffects = [];
        unit.statusEffects.push(instance);
        return instance;
    }
  }
  
  // New effect
  if (!unit.statusEffects) {
    unit.statusEffects = [];
  }
  unit.statusEffects.push(instance);
  
  return instance;
}

/**
 * Tick all status effects on a unit
 * Call this once per combat tick
 */
export function tickStatusEffects(unit: Unit): void {
  if (!unit.statusEffects || unit.statusEffects.length === 0) {
    return;
  }
  
  // Process each effect
  const toRemove: string[] = [];
  
  for (const effect of unit.statusEffects) {
    effect.tickCounter++;
    effect.remainingDuration--;
    
    // Check if effect should be applied this tick
    if (effect.tickCounter >= effect.tickInterval) {
      effect.tickCounter = 0;
      
      // Find template to get effect details
      const template = REGISTRY[effect.templateId];
      if (!template) continue;
      
      // Apply effect based on type
      switch (template.type) {
        case StatusEffectType.DAMAGE_OVER_TIME:
          // BUG FIX: Check if unit can be attacked (not invulnerable/frozen)
          // and if unit is alive before applying DoT damage
          if (template.damage && canBeAttacked(unit)) {
            const damage = template.damage * effect.stacks;
            // Don't kill unit - cap at 1 HP minimum if alive
            if (unit.hp > 0) {
              unit.hp = Math.max(1, unit.hp - damage);
            }
          }
          break;
          
        case StatusEffectType.HEAL_OVER_TIME:
          // BUG FIX: Only heal if unit is alive and can be attacked
          if (template.heal && unit.hp > 0) {
            const heal = template.heal * effect.stacks;
            unit.hp = Math.min(unit.maxHp, unit.hp + heal);
          }
          break;
      }
    }
    
    // Check if expired
    if (effect.remainingDuration <= 0) {
      toRemove.push(effect.id);
    }
  }
  
  // Remove expired effects
  if (toRemove.length > 0) {
    unit.statusEffects = unit.statusEffects.filter(
      e => !toRemove.includes(e.id)
    );
  }
}

/**
 * Check if unit is affected by a specific status
 */
export function hasStatusEffect(unit: Unit, templateId: string): boolean {
  return unit.statusEffects?.some(e => e.templateId === templateId) ?? false;
}

/**
 * Get all status effects of a specific category
 */
export function getStatusEffectsByCategory(
  unit: Unit,
  category: StatusEffectCategory
): StatusEffectInstance[] {
  return unit.statusEffects?.filter(e => {
    const template = REGISTRY[e.templateId];
    return template?.category === category;
  }) ?? [];
}

/**
 * Check if unit can act (not stunned/frozen/sleeping)
 */
export function canAct(unit: Unit): boolean {
  const controlEffects = getStatusEffectsByCategory(unit, StatusEffectCategory.CONTROL);
  
  for (const effect of controlEffects) {
    const template = REGISTRY[effect.templateId];
    if (template?.preventsAction) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if unit can cast (not silenced)
 */
export function canCast(unit: Unit): boolean {
  if (!canAct(unit)) return false;
  
  const silenceEffect = unit.statusEffects?.find(
    e => REGISTRY[e.templateId]?.preventsCast
  );
  
  return !silenceEffect;
}

// ========== IMMUNITY SYSTEM ==========

/**
 * Check if unit is immune to a specific status effect
 * Unit is immune if it has a matching immunity effect active
 */
export function isImmuneTo(unit: Unit, statusEffectId: string): boolean {
  if (!unit.statusEffects || unit.statusEffects.length === 0) {
    return false;
  }
  
  const statusTemplate = REGISTRY[statusEffectId];
  if (!statusTemplate) return false;
  
  // Check for specific immunity
  for (const effect of unit.statusEffects) {
    const effectTemplate = REGISTRY[effect.templateId];
    if (!effectTemplate) continue;
    
    // Check for matching immunity
    if (effectTemplate.category === StatusEffectCategory.SPECIAL) {
      // Map status effect type to immunity
      const immunityMap: Record<string, string[]> = {
        [StatusEffectType.STUN]: ['immune_stun', 'invulnerable'],
        [StatusEffectType.FREEZE]: ['immune_freeze', 'invulnerable'],
        [StatusEffectType.SLEEP]: ['immune_sleep', 'invulnerable'],
        [StatusEffectType.SILENCE]: ['immune_silence', 'invulnerable'],
        [StatusEffectType.ROOT]: ['immune_root', 'invulnerable'],
        [StatusEffectType.DAMAGE_OVER_TIME]: ['immune_dot', 'invulnerable'],
        [StatusEffectType.INVISIBLE]: ['immune_invisible'],
      };
      
      const immuneIds = immunityMap[statusTemplate.type] || [];
      if (immuneIds.includes(effectTemplate.id)) {
        return true;
      }
      
      // If has general invulnerable, immune to most things
      if (effectTemplate.type === StatusEffectType.INVULNERABLE && 
          statusTemplate.category !== StatusEffectCategory.BUFF) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if unit can be targeted by enemies
 * Returns false if unit is INVISIBLE, INVULNERABLE, or FROZEN
 */
export function canBeTargeted(unit: Unit): boolean {
  if (!unit.statusEffects || unit.statusEffects.length === 0) {
    return true;
  }
  
  for (const effect of unit.statusEffects) {
    const effectTemplate = REGISTRY[effect.templateId];
    if (!effectTemplate) continue;
    
    // INVISIBLE, INVULNERABLE, or FREEZE cannot be targeted
    if (effectTemplate.type === StatusEffectType.INVISIBLE ||
        effectTemplate.type === StatusEffectType.INVULNERABLE ||
        effectTemplate.type === StatusEffectType.FREEZE) {
      return false;
    }
    
    // Check explicit flags
    if (effectTemplate.preventsTargeting === true) {
      return false;
    }
    
    // If preventsBeingAttacked is true, also cannot be targeted
    if (effectTemplate.preventsBeingAttacked === true) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if unit can be attacked (take ANY damage)
 * Returns false if unit is FROZEN (completely untargetable)
 * - INVISIBLE: Can still take AOE damage, so canBeAttacked = true
 * - FREEZE: Cannot be targeted at all, so canBeAttacked = false
 * - INVULNERABLE: Cannot be targeted, so canBeAttacked = false
 */
export function canBeAttacked(unit: Unit): boolean {
  if (!unit.statusEffects || unit.statusEffects.length === 0) {
    return true;
  }
  
  for (const effect of unit.statusEffects) {
    const effectTemplate = REGISTRY[effect.templateId];
    if (!effectTemplate) continue;
    
    // FREEZE - completely cannot be attacked
    if (effectTemplate.type === StatusEffectType.FREEZE) {
      return false;
    }
    
    // INVULNERABLE - cannot be attacked
    if (effectTemplate.type === StatusEffectType.INVULNERABLE) {
      return false;
    }
    
    // If explicitly marked as preventsBeingAttacked
    if (effectTemplate.preventsBeingAttacked === true) {
      return false;
    }
    
    // If completely immune (FREEZE) - takes no damage at all
    if (effectTemplate.completelyImmune === true) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if unit is completely immune to ALL damage
 * Returns true if unit has completelyImmune flag (FREEZE)
 * - Unit takes NO damage whatsoever - not from attacks, DoT, AOE, or anything
 */
export function isCompletelyImmune(unit: Unit): boolean {
  if (!unit.statusEffects || unit.statusEffects.length === 0) {
    return false;
  }
  
  for (const effect of unit.statusEffects) {
    const effectTemplate = REGISTRY[effect.templateId];
    if (!effectTemplate) continue;
    
    // FREEZE - completely immune to all damage
    if (effectTemplate.completelyImmune === true) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if unit can pass through enemies (PHASED)
 */
export function canPassThrough(unit: Unit): boolean {
  if (!unit.statusEffects || unit.statusEffects.length === 0) {
    return false;
  }
  
  for (const effect of unit.statusEffects) {
    const effectTemplate = REGISTRY[effect.templateId];
    if (!effectTemplate) continue;
    
    if (effectTemplate.type === StatusEffectType.PHASED ||
        effectTemplate.allowsPassThrough === true) {
      return true;
    }
  }
  
  return false;
}

// ========== DISPEL SYSTEM ==========

/**
 * Remove a specific status effect from unit
 */
export function removeStatusEffect(unit: Unit, statusEffectId: string): boolean {
  if (!unit.statusEffects) return false;
  
  const index = unit.statusEffects.findIndex(
    e => e.templateId === statusEffectId
  );
  
  if (index >= 0) {
    unit.statusEffects.splice(index, 1);
    return true;
  }
  
  return false;
}

/**
 * Remove all status effects of a specific category
 */
export function dispelByCategory(unit: Unit, category: StatusEffectCategory): number {
  if (!unit.statusEffects) return 0;
  
  let removed = 0;
  unit.statusEffects = unit.statusEffects.filter(effect => {
    const template = REGISTRY[effect.templateId];
    if (template?.category === category) {
      removed++;
      return false; // Remove
    }
    return true; // Keep
  });
  
  return removed;
}

/**
 * Remove all debuffs from unit (enemy-applied effects)
 * Keeps buffs (positive effects)
 */
export function dispelDebuffs(unit: Unit): number {
  if (!unit.statusEffects) return 0;
  
  let removed = 0;
  unit.statusEffects = unit.statusEffects.filter(effect => {
    const template = REGISTRY[effect.templateId];
    if (!template) return true;
    
    // Keep buffs, remove debuffs and control effects
    if (template.category === StatusEffectCategory.BUFF || 
        template.category === StatusEffectCategory.HOT) {
      return true; // Keep
    }
    
    removed++;
    return false; // Remove
  });
  
  return removed;
}

/**
 * Remove all buffs from unit (for cleanse effects)
 */
export function dispelBuffs(unit: Unit): number {
  if (!unit.statusEffects) return 0;
  
  let removed = 0;
  unit.statusEffects = unit.statusEffects.filter(effect => {
    const template = REGISTRY[effect.templateId];
    if (!template) return true;
    
    // Keep debuffs, remove buffs
    if (template.category === StatusEffectCategory.DEBUFF || 
        template.category === StatusEffectCategory.CONTROL ||
        template.category === StatusEffectCategory.DOT) {
      return true; // Keep
    }
    
    removed++;
    return false; // Remove
  });
  
  return removed;
}

/**
 * Remove all status effects (full dispel)
 */
export function dispelAll(unit: Unit): number {
  if (!unit.statusEffects) return 0;
  
  const count = unit.statusEffects.length;
  unit.statusEffects = [];
  return count;
}

/**
 * Check if unit has any debuffs
 */
export function hasDebuffs(unit: Unit): boolean {
  if (!unit.statusEffects || unit.statusEffects.length === 0) return false;
  
  return unit.statusEffects.some(effect => {
    const template = REGISTRY[effect.templateId];
    return template?.category === StatusEffectCategory.DEBUFF ||
           template?.category === StatusEffectCategory.CONTROL ||
           template?.category === StatusEffectCategory.DOT;
  });
}

/**
 * Check if unit has any buffs
 */
export function hasBuffs(unit: Unit): boolean {
  if (!unit.statusEffects || unit.statusEffects.length === 0) return false;
  
  return unit.statusEffects.some(effect => {
    const template = REGISTRY[effect.templateId];
    return template?.category === StatusEffectCategory.BUFF ||
           template?.category === StatusEffectCategory.HOT;
  });
}

// ========== REGISTRY ==========

// This will be populated by index.ts
export const REGISTRY: Record<string, StatusEffectTemplate> = {};

/**
 * Get status effect by ID
 */
export function getStatusEffect(id: string): StatusEffectTemplate | undefined {
  return REGISTRY[id];
}

/**
 * Get all status effects
 */
export function getAllStatusEffects(): StatusEffectTemplate[] {
  return Object.values(REGISTRY);
}

/**
 * Get status effects by category
 */
export function getStatusEffectsByCategoryType(category: StatusEffectCategory): StatusEffectTemplate[] {
  return Object.values(REGISTRY).filter(e => e.category === category);
}
