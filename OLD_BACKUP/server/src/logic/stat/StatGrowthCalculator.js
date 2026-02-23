const GrowthCurveType = require('./GrowthCurveType');

/**
 * StatGrowthCalculator - Handles complex growth curve calculations for stats.
 */
class StatGrowthCalculator {
    /**
     * Calculate growth value at a specific level.
     * @param {number} baseValue - Original base value.
     * @param {number} level - Target level.
     * @param {Object} config - Curve configuration (type, factor, midpoint, steepness).
     * @param {Object} options - Additional options (baseLevel, power).
     * @returns {number} Calculated value at level.
     */
    static calculateValueAtLevel(baseValue, level, config, options = {}) {
        const baseLevel = options.baseLevel || 1;
        const levelDiff = level - baseLevel;
        
        if (levelDiff <= 0) return baseValue;

        const { curveType, curveFactor, curveMidpoint, curveSteepness } = config;

        switch (curveType) {
            case GrowthCurveType.LINEAR:
                return baseValue + (curveFactor * levelDiff);
            
            case GrowthCurveType.EXPONENTIAL:
                return baseValue * Math.pow(curveFactor, levelDiff);
            
            case GrowthCurveType.SIGMOID: {
                const sigmoidValue = 1 / (1 + Math.exp(-curveSteepness * (level - curveMidpoint)));
                return baseValue * (1 + (curveFactor - 1) * sigmoidValue);
            }
            
            case GrowthCurveType.POLYNOMIAL:
                return baseValue + (curveFactor * Math.pow(levelDiff, options.power || 2));
            
            case GrowthCurveType.LOGARITHMIC:
                return baseValue + (curveFactor * Math.log(levelDiff + 1));
            
            default:
                return baseValue + (curveFactor * levelDiff);
        }
    }
}

module.exports = StatGrowthCalculator;
