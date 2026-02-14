/**
 * StatHistoryService
 * Manages hero stat history recording and retrieval.
 * Single Responsibility: Handle historical stat data and snapshots.
 */
const BaseService = require('../BaseService');

class StatHistoryService extends BaseService {
    /**
     * Create the history service.
     * @param {Object} calculationEngine - Reference to StatCalculationEngine for data fetching and calculation.
     */
    constructor(calculationEngine) {
        super();
        this.calculationEngine = calculationEngine;
    }

    /**
     * Get stat history for a hero.
     * @param {number} heroId - Hero ID.
     * @param {Object} options - Pagination options.
     * @returns {Promise<Object>} Stat history with pagination.
     */
    async getStatHistory(heroId, options = {}) {
        const { limit = 50, offset = 0 } = options;
        
        const history = await this.db.heroStatHistory.findMany({
            where: { heroId },
            include: {
                historyStats: true,
                historyEquip: { include: { itemTemplate: true } },
                historyBuffs: { include: { trait: true } }
            },
            orderBy: { recordedAt: 'desc' },
            take: limit,
            skip: offset
        });
        
        const total = await this.db.heroStatHistory.count({
            where: { heroId }
        });
        
        return {
            history,
            pagination: { limit, offset, total }
        };
    }

    /**
     * Capture a snapshot of current hero stats.
     * @param {number} heroId - Hero ID.
     * @param {string} trigger - Reason for snapshot (LEVEL_UP, RESET, etc).
     * @param {Object} context - Additional context.
     */
    async saveStatSnapshot(heroId, trigger, context = {}) {
        // Use engine to fetch data to ensure consistency with calculation context
        const heroData = await this.calculationEngine.fetchHeroData(heroId);
        if (!heroData) return;

        // Calculate current stats using the engine
        const stats = await this.calculationEngine.calculateHeroStats(heroId);
        
        await this.runTransaction(async (tx) => {
            const primaryStatsDerived = this._extractPrimaryStats(stats);
            
            const history = await tx.heroStatHistory.create({
                data: {
                    heroId,
                    level: heroData.unitLevel,
                    // Legacy JSON fields (Double Write for safety)
                    primaryStats: JSON.stringify(primaryStatsDerived),
                    secondaryStats: JSON.stringify(stats), 
                    equippedItems: JSON.stringify(heroData.equipment),
                    activeBuffs: JSON.stringify(heroData.buffs)
                    // trigger field not present in schema
                }
            });

            // Save Relational Stats
            // 1. Secondary stats (root properties)
            const statEntries = Object.entries(stats).map(([key, val]) => ({
                historyId: history.id,
                statKey: key,
                statValue: (typeof val === 'object' && val !== null) ? val.value : val,
                category: this._getStatCategory(key)
            }));
            
            // 2. Primary stats (nested in attributes) if available
            if (stats.attributes) {
                Object.entries(stats.attributes).forEach(([key, val]) => {
                     statEntries.push({
                        historyId: history.id,
                        statKey: key,
                        statValue: typeof val === 'object' ? val.value : val,
                        category: 'PRIMARY'
                     });
                });
            }

            // Filter out invalid/object entries (like 'attributes', 'calculationLayers')
            const validStatEntries = statEntries.filter(entry => 
                typeof entry.statValue === 'number' && !isNaN(entry.statValue) &&
                entry.statKey !== 'attributes' && entry.statKey !== 'calculationLayers'
            );
            
            if (validStatEntries.length > 0) {
                await tx.heroHistoryStat.createMany({ data: validStatEntries });
            }

            // Save Relational Equipment
            const equipment = heroData.equipment || [];
            if (equipment.length > 0) {
                const equipEntries = equipment
                    .filter(eq => eq && eq.slotKey && eq.itemInstanceId)
                    .map(eq => ({
                        historyId: history.id,
                        slotKey: eq.slotKey,
                        itemInstanceId: eq.itemInstanceId
                    }));
                
                if (equipEntries.length > 0) {
                    await tx.heroHistoryEquipment.createMany({ data: equipEntries });
                }
            }
        });
    }

    /**
     * Extract primary stats from calculated stats.
     * @param {Object} stats - Calculated stats.
     * @returns {Object} Primary stats subset.
     * @private
     */
    _extractPrimaryStats(stats) {
        // Robust extraction: check attributes property first
        const src = stats.attributes || stats;
        return {
            str: src.str ?? 0, 
            dex: src.dex ?? 0, 
            int: src.int ?? 0, 
            vit: src.vit ?? 0, 
            luk: src.luk ?? 0
        };
    }

    /**
     * Categorize a stat key.
     * @param {string} key - Stat key.
     * @returns {string} Category (PRIMARY or SECONDARY).
     * @private
     */
    _getStatCategory(key) {
        if (['str','dex','int','vit','luk'].includes(key)) return 'PRIMARY';
        if (key === 'attributes' || key === 'calculationLayers') return 'META';
        return 'SECONDARY';
    }
}

module.exports = StatHistoryService;
