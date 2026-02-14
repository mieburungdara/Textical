/**
 * StatSimulationService.js
 * Manages hypothetical stat calculations and comparisons.
 * Single Responsibility: Provide "What-If" analysis and previews.
 */
const BaseService = require('../BaseService');

class StatSimulationService extends BaseService {
    /**
     * Create the simulation service.
     * @param {Object} calculationEngine - Reference to StatCalculationEngine.
     */
    constructor(calculationEngine) {
        super();
        this.calculationEngine = calculationEngine;
    }

    /**
     * Simulate stats with hypothetical changes.
     * @param {number} heroId - Hero ID.
     * @param {Object} additions - Mock additions { equipment: [], buffs: [], stats: {} }.
     * @param {Object} context - Base context.
     * @returns {Promise<Object>} Simulated stats.
     */
    async simulateStats(heroId, additions = {}, context = {}) {
        const heroData = await this.calculationEngine.fetchHeroData(heroId);
        if (!heroData) throw new Error('Hero not found');

        const mockHero = JSON.parse(JSON.stringify(heroData));

        if (additions.equipment) {
            additions.equipment.forEach(newItem => {
                const idx = mockHero.equipment.findIndex(e => e.slot === newItem.slot);
                if (idx !== -1) mockHero.equipment[idx] = newItem;
                else mockHero.equipment.push(newItem);
            });
        }

        if (additions.buffs) {
            mockHero.buffs = [...(mockHero.buffs || []), ...additions.buffs];
        }

        if (additions.stats) {
            Object.entries(additions.stats).forEach(([stat, val]) => {
                mockHero[stat] = (mockHero[stat] || 0) + val;
            });
        }

        return await this.calculationEngine.calculateStatsWithBreakdown(heroId, {
            ...context,
            mockHeroData: mockHero,
            forceRecalculate: true
        });
    }

    /**
     * Compare stats with equipment preview.
     * @param {number} heroId - Hero ID.
     * @param {Object} previewEquipment - Preview equipment changes.
     * @returns {Promise<Object>} Current vs preview stats comparison.
     */
    async compareStats(heroId, previewEquipment = {}) {
        const currentStats = await this.calculationEngine.calculateStatsWithBreakdown(heroId);
        
        const hero = await this.calculationEngine.fetchHeroData(heroId);
        const previewHero = {
            ...hero,
            equipment: previewEquipment
        };
        
        const previewStats = await this.calculationEngine.calculateStatsWithBreakdown(heroId, {
            mockHeroData: previewHero,
            forceRecalculate: true
        });
        
        const differences = {};
        
        const compareValues = (current, preview, prefix) => {
            Object.entries(current).forEach(([key, value]) => {
                if (typeof value === 'number' && typeof preview[key] === 'number') {
                    const diff = preview[key] - current[key];
                    // Only record non-zero differences to keep output clean, 
                    // or record all if strict comparison needed. 
                    // Original code recorded all common keys.
                    differences[`${prefix}${key}`] = {
                        current: value,
                        preview: preview[key],
                        difference: diff
                    };
                }
            });
        };
        
        compareValues(currentStats, previewStats, '');
        
        if (currentStats.attributes && previewStats.attributes) {
            compareValues(currentStats.attributes, previewStats.attributes, 'attr_');
        }
        
        return {
            current: currentStats,
            preview: previewStats,
            differences,
            isImproved: Object.values(differences).some(d => d.difference > 0)
        };
    }
}

module.exports = StatSimulationService;
