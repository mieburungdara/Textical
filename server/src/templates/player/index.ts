/**
 * Player Module Index
 * 
 * Exports all player/party/unit-related functionality.
 * Note: This system uses UNIT progression (not player progression),
 * as players can have up to 50 units in their party.
 */

// Unit Progression (each unit levels up independently)
export * from './UnitProgression.js';

// Party System (manages up to 50 units)
export * from './Party.js';

// Re-export commonly used items
export { 
  MAX_UNIT_LEVEL, 
  MAX_UNITS_PER_PARTY,
  BASE_XP_REQUIRED, 
  XP_CURVE_EXPONENT
} from './UnitProgression.js';
