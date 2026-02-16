/**
 * Enhanced Stat System - Backward Compatibility Module
 * 
 * This file has been refactored into separate modules for better SRP compliance.
 * 
 * Use the new modules:
 * - StatCalculationEngine: require('../services/stat/StatCalculationEngine')
 * - stat module: require('./stat')
 */

// Import from the new stat/ directory
const statModule = require('./stat');

module.exports = {
    ...statModule
};
