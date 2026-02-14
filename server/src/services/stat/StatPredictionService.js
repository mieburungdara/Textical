/**
 * StatPredictionService
 * Handles stat forecasting and level-up predictions.
 */
const StatCurveCalculator = require('./StatCurveCalculator');
const { GrowthCurveType } = require('../../logic/stat');

class StatPredictionService {
    constructor(engine) {
        this.engine = engine;
    }

    /**
     * Predict stats at a specific level.
     * @param {number} heroId - Hero ID.
     * @param {number} targetLevel - Target level.
     * @param {Object} options - Options for prediction.
     * @returns {Promise<Object>} Predicted stats.
     */
    async predictStatsAtLevel(heroId, targetLevel, options = {}) {
        const currentStats = await this.engine.calculateHeroStats(heroId, options);
        const heroData = await this.engine.fetchHeroData(heroId);
        
        const predicted = { ...currentStats };
        predicted.attributes = { ...currentStats.attributes };
        predicted.predictedLevel = targetLevel;
        predicted.isPrediction = true;

        const levelDiff = targetLevel - heroData.unitLevel;
        
        if (levelDiff > 0) {
            const classTemplate = heroData.combatClass;
            
            Object.entries(predicted).forEach(([key, value]) => {
                if (typeof value === 'number' && !['unitLevel', 'classLevel'].includes(key)) {
                    const growthRate = this._getGrowthRate(key, classTemplate);
                    if (growthRate > 0) {
                        const growthBonus = StatCurveCalculator.calculateLinear(
                            0, growthRate * levelDiff, targetLevel
                        );
                        predicted[key] = value + growthBonus;
                    }
                }
            });

            const statAllocation = heroData.statAllocation;
            if (statAllocation) {
                const growthConfig = {
                    type: GrowthCurveType.LINEAR,
                    rate: 1
                };
                
                ['str', 'dex', 'int', 'vit', 'luk'].forEach(attr => {
                    const allocated = statAllocation[`${attr}Allocated`] || 0;
                    const growthBonus = StatCurveCalculator.calculateGrowthToLevel(
                        allocated, 
                        heroData.unitLevel, 
                        targetLevel,
                        growthConfig
                    );
                    predicted.attributes[attr] += growthBonus;
                });
            }
        }

        const caps = this.engine.statCapResolver.getCaps({
            ...heroData,
            unitLevel: targetLevel
        });
        
        const capped = this.engine.statCapResolver.applyAllCaps(predicted, caps);
        Object.assign(predicted, capped.stats);

        return predicted;
    }

    /**
     * Get growth rate for a stat.
     * @param {string} statKey - Stat key name.
     * @param {Object} classTemplate - Combat class template.
     * @returns {number} Growth rate value.
     * @private
     */
    _getGrowthRate(statKey, classTemplate) {
        const growthMap = {
            health_max: classTemplate?.hpGrowth || 0,
            mana_max: classTemplate?.mpGrowth || 0,
            attack_damage: classTemplate?.atkGrowth || 0,
            defense: classTemplate?.defGrowth || 0,
            speed: classTemplate?.spdGrowth || 0
        };
        return growthMap[statKey] || 0;
    }
}

module.exports = StatPredictionService;
