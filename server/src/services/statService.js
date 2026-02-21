/**
 * EnhancedStatService (Facade)
 * Orchestrates hero stat management by delegating to SRP-compliant modules.
 * Delegates: calculation to StatCalculationEngine, history to StatHistoryService.
 */
const BaseService = require('./BaseService');
const StatCalculationEngine = require('./stat/StatCalculationEngine');
const StatHistoryService = require('./stat/StatHistoryService');
const StatQueryService = require('./stat/StatQueryService');
const StatSimulationService = require('./stat/StatSimulationService');
const StatRecoveryService = require('./stat/StatRecoveryService');

class EnhancedStatService extends BaseService {
    /**
     * Create the stat service facade.
     * @param {Object} options - Configuration options.
     */
    constructor(options = {}) {
        super();
        // Core calculation engine (SRP: all calculation logic lives here)
        this.calculationEngine = new StatCalculationEngine(options);
        
        // History service (SRP: handles snapshots and history retrieval)
        this.historyService = new StatHistoryService(this.calculationEngine);

        // Query service (SRP: handles various stat queries)
        this.queryService = new StatQueryService(this.calculationEngine);

        // Simulation service (SRP: handles hypothetical stats)
        this.simulationService = new StatSimulationService(this.calculationEngine);

        // Recovery service (SRP: handles regeneration logic)
        this.recoveryService = new StatRecoveryService(this.calculationEngine);
    }

    // =========================================================================
    // DELEGATED: Calculation Pipeline → StatCalculationEngine
    // =========================================================================

    /**
     * Calculate complete hero stats with layered processing.
     * @param {number} heroId - Hero ID.
     * @param {Object} context - Calculation context.
     * @returns {Promise<Object>} Calculated stats.
     */
    async calculateHeroStats(heroId, context = {}) {
        return this.calculationEngine.calculateHeroStats(heroId, context);
    }

    /**
     * Calculate stats with detailed breakdown for UI.
     * @param {number} heroId - Hero ID.
     * @param {Object} context - Calculation context.
     * @returns {Promise<Object>} Stats with breakdown.
     */
    async calculateStatsWithBreakdown(heroId, context = {}) {
        return this.calculationEngine.calculateStatsWithBreakdown(heroId, context);
    }

    /**
     * Predict stats at a specific level.
     * @param {number} heroId - Hero ID.
     * @param {number} targetLevel - Target level.
     * @param {Object} options - Options.
     * @returns {Promise<Object>} Predicted stats.
     */
    async predictStatsAtLevel(heroId, targetLevel, options = {}) {
        return this.calculationEngine.predictStatsAtLevel(heroId, targetLevel, options);
    }

    /**
     * Invalidate cache for a hero.
     * @param {number} heroId - Hero ID.
     */
    invalidateHeroCache(heroId) {
        this.calculationEngine.invalidateHeroCache(heroId);
    }

    /**
     * Clear all caches.
     */
    clearCache() {
        this.calculationEngine.clearCache();
    }

    /**
     * Bulk recalculation of all hero stats (Admin Tool).
     * @returns {Promise<Object>} Results.
     */
    async recalculateAllHeroes() {
        return this.calculationEngine.recalculateAllHeroes();
    }

    /**
     * Get stat formula and cap metadata for UI.
     * @returns {Object} Metadata.
     */
    getStatMetadata() {
        return this.calculationEngine.getStatMetadata();
    }

    // =========================================================================
    // HISTORY: Stat Snapshot & History → StatHistoryService
    // =========================================================================

    /**
     * Get stat history for a hero.
     * @param {number} heroId - Hero ID.
     * @param {Object} options - Pagination options.
     * @returns {Promise<Object>} Stat history with pagination.
     */
    async getStatHistory(heroId, options = {}) {
        return this.historyService.getStatHistory(heroId, options);
    }

    /**
     * Capture a snapshot of current hero stats.
     * @param {number} heroId - Hero ID.
     * @param {string} trigger - Reason for snapshot (LEVEL_UP, RESET, etc).
     * @param {Object} context - Additional context.
     */
    async saveStatSnapshot(heroId, trigger, context = {}) {
        return this.historyService.saveStatSnapshot(heroId, trigger, context);
    }

    // =========================================================================
    // SIMULATION: What-If Analysis
    // =========================================================================

    /**
     * Simulate stats with hypothetical changes.
     * @param {number} heroId - Hero ID.
     * @param {Object} additions - Mock additions { equipment: [], buffs: [], stats: {} }.
     * @param {Object} context - Base context.
     * @returns {Promise<Object>} Simulated stats.
     */
    async simulateStats(heroId, additions = {}, context = {}) {
        return this.simulationService.simulateStats(heroId, additions, context);
    }

    /**
     * Compare stats with equipment preview.
     * @param {number} heroId - Hero ID.
     * @param {Object} previewEquipment - Preview equipment changes.
     * @returns {Promise<Object>} Current vs preview stats comparison.
     */
    async compareStats(heroId, previewEquipment = {}) {
        return this.simulationService.compareStats(heroId, previewEquipment);
    }

    // =========================================================================
    // RECOVERY: HP/Mana/Vitality Recovery Info
    // =========================================================================


    // =========================================================================
    // QUERY: Stat Capabilities, Elemental, Set Bonuses, Equipment
    // =========================================================================

    /**
     * Get stat capabilities for a hero.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Stat caps, available points, growth info.
     */
    async getStatCapabilities(heroId) {
        return this.queryService.getStatCapabilities(heroId);
    }

    /**
     * Get elemental stats for a hero.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Elemental affinities, resistances, bonus damage.
     */
    async getElementalStats(heroId) {
        return this.queryService.getElementalStats(heroId);
    }

    /**
     * Get set bonuses for a hero.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Equipped sets, active bonuses, synergy info.
     */
    async getSetBonuses(heroId) {
        return this.queryService.getSetBonuses(heroId);
    }

    /**
     * Get equipment stats for a hero.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Equipment stat bonuses, quality modifiers, durability impact.
     */
    async getEquipmentStats(heroId) {
        return this.queryService.getEquipmentStats(heroId);
    }

    /**
     * Get recovery stats and Time-To-Full.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Recovery details.
     */
    async getRecoveryStats(heroId) {
        return this.recoveryService.getRecoveryStats(heroId);
    }

    // =========================================================================
    // FIXED GROWTH SYSTEM: Automatic class-based stat calculation
    // =========================================================================

    /**
     * Get growth information for a specific class (for UI display).
     * @param {string} className - The class name.
     * @returns {Object} Growth information.
     */
    getGrowthInfo(className) {
        return this.calculationEngine.getGrowthInfo(className);
    }

    /**
     * Explain the formula for a specific stat.
     * @param {string} className - The class name.
     * @param {string} statKey - The stat key.
     * @returns {string} Formula explanation.
     */
    explainStatFormula(className, statKey) {
        return this.calculationEngine.explainStatFormula(className, statKey);
    }

    /**
     * Calculate fixed stats for a class at a specific level.
     * TODO: Implement database-based class growth system.
     * @param {string} className - The class name.
     * @param {number} level - The target level.
     * @returns {Object} Calculated stats.
     */
    calculateFixedStats(className, level) {
        // TODO: Query classTemplate table from database
        // Returning default values for now - needs database implementation
        console.warn('[statService] calculateFixedStats not implemented - using defaults');
        return {
            hp: 100 + (level - 1) * 5,
            mana: 40 + (level - 1) * 3,
            physicalAttack: 10 + (level - 1) * 2,
            magicalAttack: 10 + (level - 1) * 2,
            defense: 5 + (level - 1) * 1,
            speed: 5 + (level - 1) * 0.5,
            critChance: 0.05,
            critDamage: 1.5,
            dodgeChance: 0.03,
            blockChance: 0,
            parryChance: 0,
            accuracy: 100,
            hpRegen: 0,
            manaRegen: 2
        };
    }

    /**
     * Check if the fixed growth system is enabled.
     * @returns {boolean} True if enabled.
     */
    isFixedGrowthEnabled() {
        return true;
    }


}

// Export
module.exports = new EnhancedStatService();
