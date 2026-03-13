/**
 * Party System
 * 
 * Manages a player's party of units (max 50 units).
 * Each unit has its own progression (XP, level, stats).
 */

import { Unit } from '../../combat/TickCost.js';
import logger from '../../utils/logger.js';
import { 
  UnitProgression, 
  createUnitProgression,
  addXpAndLevelUp,
  getProgressionSummary,
  LevelUpResult,
  MAX_UNITS_PER_PARTY
} from './UnitProgression.js';

// ========== PARTY ENTITY ==========

export interface Party {
  id: string;
  ownerId: string;
  name: string;
  
  // Units in party (max 50)
  units: PartyUnit[];
  
  // Timestamp
  createdAt: number;
  updatedAt: number;
}

export interface PartyUnit {
  // Unit reference
  unit: Unit;
  
  // Progression data
  progression: UnitProgression;
  
  // Position in party (0-49)
  position: number;
}

// ========== PARTY FACTORY ==========

export interface CreatePartyOptions {
  id: string;
  ownerId: string;
  name: string;
}

/**
 * Create a new party
 */
export function createParty(options: CreatePartyOptions): Party {
  return {
    id: options.id,
    ownerId: options.ownerId,
    name: options.name,
    units: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ========== PARTY UNIT MANAGEMENT ==========

/**
 * Add a unit to the party
 */
export function addUnitToParty(
  party: Party,
  unit: Unit,
  startingLevel: number = 1
): PartyUnit | null {
  if (party.units.length >= MAX_UNITS_PER_PARTY) {
    logger.warn(`[Party] Cannot add unit - party is full (max ${MAX_UNITS_PER_PARTY})`);
    return null;
  }
  
  const position = party.units.length;
  const progression = createUnitProgression(unit.id, startingLevel);
  
  const partyUnit: PartyUnit = {
    unit,
    progression,
    position,
  };
  
  party.units.push(partyUnit);
  party.updatedAt = Date.now();
  
  return partyUnit;
}

/**
 * Remove a unit from the party
 */
export function removeUnitFromParty(party: Party, unitId: string): boolean {
  const index = party.units.findIndex(u => u.unit.id === unitId);
  
  if (index === -1) {
    return false;
  }
  
  party.units.splice(index, 1);
  
  // Reorder positions
  party.units.forEach((u, i) => {
    u.position = i;
  });
  
  party.updatedAt = Date.now();
  return true;
}

/**
 * Get a unit from the party
 */
export function getUnitFromParty(party: Party, unitId: string): PartyUnit | undefined {
  return party.units.find(u => u.unit.id === unitId);
}

// ========== PARTY ACTIONS ==========

/**
 * Add XP to a specific unit in the party
 */
export function unitGainXp(party: Party, unitId: string, xp: number): LevelUpResult | null {
  const partyUnit = getUnitFromParty(party, unitId);
  
  if (!partyUnit) {
    return null;
  }
  
  const result = addXpAndLevelUp(partyUnit.progression, xp);
  
  party.updatedAt = Date.now();
  return result;
}

/**
 * Add XP to all units in the party (distributed evenly)
 */
export function partyGainXp(party: Party, totalXp: number): Map<string, LevelUpResult> {
  const results = new Map<string, LevelUpResult>();
  
  if (party.units.length === 0 || totalXp <= 0) {
    return results;
  }
  
  // Distribute XP evenly to all units
  const xpPerUnit = Math.floor(totalXp / party.units.length);
  const remainder = totalXp % party.units.length;
  
  party.units.forEach((partyUnit, index) => {
    // First units get extra XP from remainder
    const xp = xpPerUnit + (index < remainder ? 1 : 0);
    
    const result = addXpAndLevelUp(partyUnit.progression, xp);
    
    results.set(partyUnit.unit.id, result);
  });
  
  party.updatedAt = Date.now();
  return results;
}

// ========== PARTY INFO ==========

/**
 * Get party summary
 */
export function getPartySummary(party: Party) {
  return {
    id: party.id,
    name: party.name,
    ownerId: party.ownerId,
    unitCount: party.units.length,
    maxUnits: MAX_UNITS_PER_PARTY,
    totalLevel: party.units.reduce((sum, u) => sum + u.progression.level, 0),
    units: party.units.map(u => ({
      id: u.unit.id,
      name: u.unit.name,
      position: u.position,
      level: u.progression.level,
      xp: u.progression.experience,
      xpProgress: getProgressionSummary(u.progression).xpProgress,
    })),
  };
}

/**
 * Get party total combat power
 */
export function getPartyCombatPower(party: Party): number {
  return party.units.reduce((sum, u) => {
    // Simple power calculation
    const unitPower = 
      u.unit.hp + 
      u.unit.attack * 2 + 
      u.unit.defense + 
      u.unit.speed + 
      u.unit.magic * 2;
    return sum + unitPower;
  }, 0);
}
