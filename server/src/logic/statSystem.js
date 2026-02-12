/**
 * Enhanced Stat System - Backward Compatibility Module
 * 
 * This file has been refactored into separate modules for better SRP compliance.
 * Please update imports to use the new module structure:
 * 
 * OLD: const { StatProcessor } = require('./statSystem');
 * NEW: const { StatProcessor } = require('./logic/statProcessor');
 * 
 * Or use the barrel export:
 * const { StatModifier, EnhancedStat } = require('./logic/stat');
 */

// Import from the new stat/ directory
const statModule = require('./stat');

// Also import StatProcessor if it exists elsewhere, or define it here for backward compat
let StatProcessor;
try {
    StatProcessor = require('./statProcessor');
} catch (e) {
    // statProcessor doesn't exist, create a basic one for backward compat
    StatProcessor = {
        calculateHeroStats: () => { throw new Error('StatProcessor not implemented'); },
        calculateMonsterStats: () => { throw new Error('StatProcessor not implemented'); }
    };
}

module.exports = {
    ...statModule,
    StatProcessor
};
