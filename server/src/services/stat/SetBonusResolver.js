/**
 * SetBonusResolver
 * Handles equipment set bonus detection and application.
 * Supports multiple sets, conditional bonuses, and set bonus stacking.
 */
class SetBonusResolver {
    /**
     * Condition types for set bonuses
     * @enum {string}
     */
    static ConditionType = {
        ELEMENT: 'ELEMENT',
        STAT_THRESHOLD: 'STAT_THRESHOLD',
        CLASS: 'CLASS',
        PIECE_COUNT: 'PIECE_COUNT',
        FULL_SET: 'FULL_SET'
    };

    /**
     * Initialize set bonus resolver
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.cacheEnabled = options.cacheEnabled !== false;
        this.cache = new Map();
    }

    /**
     * Register set bonuses from equipped items
     * @param {Array} equipment - Array of equipped items with set info
     * @returns {Object} Set bonus information
     */
    registerSetBonuses(equipment) {
        const setCount = {};
        const setPieces = {};

        // Group items by set
        equipment.forEach(item => {
            if (item.itemInstance?.template?.setId) {
                const setId = item.itemInstance.template.setId;
                const setName = item.itemInstance.template.setName || `Set_${setId}`;
                
                if (!setCount[setId]) {
                    setCount[setId] = 0;
                    setPieces[setId] = {
                        name: setName,
                        pieces: [],
                        totalPieces: 0
                    };
                }
                
                setCount[setId]++;
                setPieces[setId].pieces.push({
                    itemId: item.itemInstance.id,
                    itemName: item.itemInstance.template.name,
                    pieceOrder: item.itemInstance.template.pieceOrder
                });
                setPieces[setId].totalPieces = Math.max(
                    setPieces[setId].totalPieces,
                    item.itemInstance.template.pieceOrder || 0
                );
            }
        });

        return { setCount, setPieces };
    }

    /**
     * Get active bonuses for all equipped sets
     * @param {Object} setData - Set data from registerSetBonuses
     * @param {Array} setTemplates - Array of set templates with bonus definitions
     * @param {Object} heroData - Hero data for condition checking
     * @returns {Array} Active bonuses with details
     */
    getActiveBonuses(setData, setTemplates, heroData) {
        const activeBonuses = [];
        const { setCount, setPieces } = setData;

        setTemplates.forEach(template => {
            const count = setCount[template.id] || 0;
            if (count === 0) return;

            // Sort bonuses by required pieces (ascending)
            const sortedBonuses = [...template.setBonuses].sort(
                (a, b) => a.requiredPieces - b.requiredPieces
            );

            // Find the highest applicable bonus
            for (const bonus of sortedBonuses) {
                if (count >= bonus.requiredPieces) {
                    // Check conditions
                    if (this._checkBonusConditions(bonus, heroData, count, setData)) {
                        const bonusStatsObj = {};
                        if (Array.isArray(bonus.stats)) {
                            bonus.stats.forEach(s => bonusStatsObj[s.statKey] = s.statValue);
                        }
                        
                        activeBonuses.push({
                            setId: template.id,
                            setName: template.name,
                            requiredPieces: bonus.requiredPieces,
                            equippedPieces: count,
                            bonusStats: bonusStatsObj,
                            bonusSkillId: bonus.bonusSkillId,
                            conditions: bonus.conditions || [],
                            source: `SetBonus:${template.name}`
                        });
                    }
                } else {
                    break;
                }
            }
        });

        return activeBonuses;
    }

    /**
     * Check if set bonus conditions are met
     * @param {Object} bonus - Set bonus definition
     * @param {Object} heroData - Hero data for condition checking
     * @param {number} equippedCount - Number of equipped pieces
     * @param {Object} setData - Set data
     * @returns {boolean} True if all conditions are met
     */
    _checkBonusConditions(bonus, heroData, equippedCount, setData) {
        if (!bonus.conditions || bonus.conditions.length === 0) {
            return true;
        }

        const conditions = bonus.conditions;

        return conditions.every(condition => {
            switch (condition.conditionType) {
                case SetBonusResolver.ConditionType.CLASS:
                    return heroData.combatClassId === parseInt(condition.conditionValue);
                
                case SetBonusResolver.ConditionType.STAT_THRESHOLD: {
                    const [statKey, threshold] = condition.conditionValue.split(':');
                    const statValue = heroData[statKey] || 0;
                    return statValue >= parseFloat(threshold);
                }
                
                case SetBonusResolver.ConditionType.PIECE_COUNT:
                    return equippedCount >= parseInt(condition.conditionValue);
                
                case SetBonusResolver.ConditionType.FULL_SET:
                    const setTotalPieces = setData.setPieces[bonus.setId]?.totalPieces || 0;
                    return equippedCount >= setTotalPieces;
                
                default:
                    return true;
            }
        });
    }

    /**
     * Apply set bonuses to stats
     * @param {Object} stats - Stats object to modify
     * @param {Array} activeBonuses - Active set bonuses
     * @param {Function} applyMod - Function to apply modifiers
     */
    applySetBonuses(stats, activeBonuses, applyMod) {
        activeBonuses.forEach(bonus => {
            Object.entries(bonus.bonusStats || {}).forEach(([statKey, value]) => {
                const isPercent = statKey.includes('rate') || statKey.includes('chance') || statKey.includes('mult');
                applyMod(statKey, parseFloat(value), isPercent ? 1 : 0, bonus.source);
            });

            // Apply skill bonuses if any
            if (bonus.bonusSkillId) {
                applyMod('skill_bonus_ids', bonus.bonusSkillId, 0, bonus.source);
            }
        });
    }

    /**
     * Calculate set bonus synergy (bonuses from multiple sets)
     * @param {Array} activeBonuses - All active set bonuses
     * @returns {Object} Synergy information
     */
    calculateSynergy(activeBonuses) {
        const synergies = {
            totalPieceCount: 0,
            setCount: 0,
            uniqueStats: new Set(),
            totalBonusValue: {}
        };

        activeBonuses.forEach(bonus => {
            synergies.totalPieceCount += bonus.equippedPieces;
            synergies.setCount++;
            
            Object.entries(bonus.bonusStats || {}).forEach(([statKey, value]) => {
                synergies.uniqueStats.add(statKey);
                const numValue = parseFloat(value);
                synergies.totalBonusValue[statKey] = 
                    (synergies.totalBonusValue[statKey] || 0) + numValue;
            });
        });

        return {
            ...synergies,
            uniqueStats: Array.from(synergies.uniqueStats),
            totalBonusValue: synergies.totalBonusValue
        };
    }

    /**
     * Get detailed set bonus breakdown for UI
     * @param {Object} setData - Set data from registerSetBonuses
     * @param {Array} setTemplates - Set templates
     * @param {Object} heroData - Hero data
     * @returns {Object} Detailed breakdown
     */
    getDetailedBreakdown(setData, setTemplates, heroData) {
        const breakdown = {
            sets: {},
            activeBonuses: [],
            synergyBonus: null
        };

        // Build set details
        Object.entries(setData.setPieces).forEach(([setId, setInfo]) => {
            const template = setTemplates.find(t => t.id === parseInt(setId));
            const equippedCount = setData.setCount[setId] || 0;
            const totalPieces = setInfo.totalPieces;
            const missingPieces = totalPieces - equippedCount;

            breakdown.sets[setId] = {
                name: setInfo.name,
                equippedPieces: equippedCount,
                totalPieces: totalPieces,
                missingPieces: missingPieces,
                completionPercent: (equippedCount / totalPieces) * 100,
                activeBonus: null,
                nextBonus: null
            };

            if (template) {
                const sortedBonuses = [...template.setBonuses].sort(
                    (a, b) => a.requiredPieces - b.requiredPieces
                );

                // Find current and next bonus
                for (const bonus of sortedBonuses) {
                    if (equippedCount >= bonus.requiredPieces) {
                        breakdown.sets[setId].activeBonus = {
                            requiredPieces: bonus.requiredPieces,
                            description: bonus.description
                        };
                    } else if (!breakdown.sets[setId].nextBonus) {
                        breakdown.sets[setId].nextBonus = {
                            requiredPieces: bonus.requiredPieces,
                            missing: bonus.requiredPieces - equippedCount,
                            description: bonus.description
                        };
                    }
                }
            }
        });

        // Get active bonuses
        breakdown.activeBonuses = this.getActiveBonuses(setData, setTemplates, heroData);
        breakdown.synergyBonus = this.calculateSynergy(breakdown.activeBonuses);

        return breakdown;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

module.exports = SetBonusResolver;
