const { StatModifier, StatModifierType } = require('../../logic/statSystem');
const StatCurveCalculator = require('./StatCurveCalculator');

/**
 * EnhancedStatGrowthSystem
 * Calculates incremental stat gains based on Hero Level, Class Level, and Curves.
 */
class EnhancedStatGrowthSystem {
    constructor() {
        // Default base growth per level for all units
        this.defaultBaseGrowth = {
            health_max: 5,
            mana_max: 2,
            attack_damage: 0.5,
            defense: 0.5,
            speed: 0.05
        };
    }

    /**
     * Apply base growth (stats gained per unit level regardless of class)
     * @param {Object} stats - Stats object (Map of EnhancedStat objects)
     * @param {number} level - Current hero unit level
     * @param {Object} [customBaseGrowth] - Optional custom base growth values
     */
    applyBaseGrowth(stats, level, customBaseGrowth = null) {
        if (level <= 1) return;

        const effectiveLevel = level - 1;
        const growthValues = customBaseGrowth || this.defaultBaseGrowth;

        Object.entries(growthValues).forEach(([key, rate]) => {
            if (stats[key] && rate > 0) {
                const totalGain = rate * effectiveLevel;
                stats[key].addModifier(new StatModifier({
                    value: totalGain,
                    type: StatModifierType.FLAT,
                    source: 'BaseGrowth',
                    priority: 2 // Low priority, applied early
                }));
            }
        });
    }

    /**
     * Apply class-specific growth
     * @param {Object} stats - Stats object
     * @param {Object} classTemplate - DB object with growth rates and curve types
     * @param {number} level - Current class level
     */
    applyGrowth(stats, classTemplate, level) {
        if (!classTemplate || level <= 1) return;

        const growthConfig = {
            hp: { rate: classTemplate.hpGrowth, curve: classTemplate.hpGrowthCurve || 'linear' },
            mp: { rate: classTemplate.mpGrowth, curve: classTemplate.mpGrowthCurve || 'linear' },
            atk: { rate: classTemplate.atkGrowth, curve: classTemplate.atkGrowthCurve || 'linear' },
            def: { rate: classTemplate.defGrowth, curve: classTemplate.defGrowthCurve || 'linear' },
            spd: { rate: classTemplate.spdGrowth, curve: classTemplate.spdGrowthCurve || 'linear' }
        };

        const keyMap = {
            hp: 'health_max',
            mp: 'mana_max',
            atk: 'attack_damage',
            def: 'defense',
            spd: 'speed'
        };

        Object.entries(growthConfig).forEach(([prefix, config]) => {
            const statKey = keyMap[prefix];
            if (stats[statKey] && config.rate > 0) {
                // Use StatCurveCalculator for more complex growth patterns
                const curveConfig = {
                    type: config.curve,
                    rate: config.rate
                };

                const totalGain = StatCurveCalculator.calculate(0, level, curveConfig);

                stats[statKey].addModifier(new StatModifier({
                    value: totalGain,
                    type: StatModifierType.FLAT,
                    source: `ClassGrowth:${classTemplate.name}`,
                    priority: 5
                }));
            }
        });
    }

    /**
     * Get recommended distribution (delegates to StatCurveCalculator)
     */
    getRecommendedDistribution(classTemplate, level, availablePoints) {
        return StatCurveCalculator.getRecommendedDistribution(classTemplate, level, availablePoints);
    }
}

module.exports = new EnhancedStatGrowthSystem();