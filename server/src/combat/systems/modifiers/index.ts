/**
 * Modifiers Module - Action Modifier Plugin System
 * 
 * Part of Flexible Combat System
 * Exports all modifier-related types and classes
 */

// Types
export * from './types.js';

// Manager
export { ActionModifierPluginManager } from './manager.js';

// Presets
export { 
  createCriticalStrikeModifier, 
  createBerserkModifier, 
  createFirstHitModifier 
} from './presets.js';
