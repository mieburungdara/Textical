/**
 * StatCurveCalculator
 * Implements various growth curves for stat progression based on level.
 * Supports linear, exponential, and sigmoid growth curves.
 */
class StatCurveCalculator {
    /**
     * Growth curve types
     * @enum {string}
     */
    static CurveType = {
        LINEAR: 'linear',
        EXPONENTIAL: 'exponential',
        SIGMOID: 'sigmoid',
        POLYNOMIAL: 'polynomial',
        LOGARITHMIC: 'logarithmic'
    };

    /**
     * Calculate linear growth: base + (rate * level)
     * @param {number} base - Base value at level 1
     * @param {number} rate - Amount gained per level
     * @param {number} level - Current level
     * @param {Object} options - Optional configuration
     * @returns {number} Calculated stat value
     */
    static calculateLinear(base, rate, level, options = {}) {
        const effectiveLevel = Math.max(1, level);
        const offset = options.offsetLevel || 0;
        const effectiveRate = options.rateMultiplier || 1;
        
        return base + (rate * effectiveRate * (effectiveLevel - 1 + offset));
    }

    /**
     * Calculate exponential growth: base * (rate ^ level)
     * @param {number} base - Base value at level 1
     * @param {number} rate - Growth factor (e.g., 1.05 for 5% growth per level)
     * @param {number} level - Current level
     * @param {Object} options - Optional configuration
     * @returns {number} Calculated stat value
     */
    static calculateExponential(base, rate, level, options = {}) {
        const effectiveLevel = Math.max(1, level);
        const exponentBase = options.exponentBase || 1;
        const offset = options.offsetLevel || 0;
        
        const exponent = Math.pow(effectiveLevel - 1 + offset, exponentBase);
        return Math.round(base * Math.pow(rate, exponent) * 100) / 100;
    }

    /**
     * Calculate sigmoid growth: base + (max * (1 / (1 + e^(-k*(level-half)))))
     * @param {number} base - Base value at level 1
     * @param {number} max - Maximum additional value from the curve
     * @param {number} level - Current level
     * @param {number} steepness - Steepness of the sigmoid curve (k value)
     * @param {number} midpoint - Level where curve reaches half of max (default: 50)
     * @returns {number} Calculated stat value
     */
    static calculateSigmoid(base, max, level, steepness = 0.1, midpoint = 50) {
        const effectiveLevel = Math.max(1, level);
        const sigmoidValue = 1 / (1 + Math.exp(-steepness * (effectiveLevel - midpoint)));
        return Math.round((base + (max * sigmoidValue)) * 100) / 100;
    }

    /**
     * Calculate polynomial growth: base + (rate * level^power)
     * @param {number} base - Base value
     * @param {number} rate - Coefficient for the polynomial term
     * @param {number} level - Current level
     * @param {number} power - Power of the polynomial (e.g., 2 for quadratic)
     * @param {Object} options - Optional configuration
     * @returns {number} Calculated stat value
     */
    static calculatePolynomial(base, rate, level, power = 2, options = {}) {
        const effectiveLevel = Math.max(1, level);
        const offset = options.offsetLevel || 0;
        
        return base + (rate * Math.pow(effectiveLevel + offset, power));
    }

    /**
     * Calculate logarithmic growth: base + (rate * log(level + offset))
     * @param {number} base - Base value
     * @param {number} rate - Coefficient for the logarithmic term
     * @param {number} level - Current level
     * @param {number} baseLog - Base of the logarithm (default: natural log)
     * @param {Object} options - Optional configuration
     * @returns {number} Calculated stat value
     */
    static calculateLogarithmic(base, rate, level, baseLog = Math.E, options = {}) {
        const effectiveLevel = Math.max(1, level);
        const offset = options.offset || options.offsetLevel || 1;
        
        return base + (rate * Math.log(effectiveLevel + offset) / Math.log(baseLog));
    }

    /**
     * Calculate growth using a curve type specified in options
     * @param {number} base - Base value
     * @param {number} level - Current level
     * @param {Object} curveConfig - Curve configuration
     * @param {string} curveConfig.type - Curve type (linear, exponential, sigmoid, polynomial, logarithmic)
     * @param {number} curveConfig.rate - Rate or factor for the curve
     * @param {number} curveConfig.max - Maximum value (for sigmoid)
     * @param {number} curveConfig.steepness - Steepness (for sigmoid)
     * @param {number} curveConfig.power - Power (for polynomial)
     * @param {number} curveConfig.midpoint - Midpoint level (for sigmoid)
     * @param {Object} options - Additional options
     * @returns {number} Calculated stat value
     */
    static calculate(base, level, curveConfig, options = {}) {
        const curveType = curveConfig.type || StatCurveCalculator.CurveType.LINEAR;
        let rate = curveConfig.rate;
        
        // Default rate based on curve type
        if (rate === undefined) {
            rate = (curveType === StatCurveCalculator.CurveType.LINEAR) ? 10 : 1;
        }
        
        switch (curveType) {
            case StatCurveCalculator.CurveType.LINEAR:
                return StatCurveCalculator.calculateLinear(base, rate, level, options);
            
            case StatCurveCalculator.CurveType.EXPONENTIAL:
                return StatCurveCalculator.calculateExponential(base, rate, level, options);
            
            case StatCurveCalculator.CurveType.SIGMOID:
                return StatCurveCalculator.calculateSigmoid(
                    base,
                    curveConfig.max || 100,
                    level,
                    curveConfig.steepness || 0.1,
                    curveConfig.midpoint || 50
                );
            
            case StatCurveCalculator.CurveType.POLYNOMIAL:
                return StatCurveCalculator.calculatePolynomial(
                    base,
                    rate,
                    level,
                    curveConfig.power || 2,
                    options
                );
            
            case StatCurveCalculator.CurveType.LOGARITHMIC:
                return StatCurveCalculator.calculateLogarithmic(
                    base,
                    rate,
                    level,
                    curveConfig.logBase || Math.E,
                    options
                );
            
            default:
                // Default to linear if unknown type, use proper default rate
                return StatCurveCalculator.calculateLinear(base, 10, level, options);
        }
    }

    /**
     * Calculate stat value at target level from current level with growth curve
     * @param {number} currentValue - Current stat value
     * @param {number} currentLevel - Current level
     * @param {number} targetLevel - Target level
     * @param {Object} curveConfig - Curve configuration
     * @returns {number} Stat value at target level
     */
    static calculateGrowthToLevel(currentValue, currentLevel, targetLevel, curveConfig) {
        if (targetLevel <= currentLevel) return currentValue;
        
        // For exponential and logarithmic curves, calculate directly from current level
        if (curveConfig.type === StatCurveCalculator.CurveType.EXPONENTIAL || 
            curveConfig.type === StatCurveCalculator.CurveType.LOGARITHMIC ||
            curveConfig.type === StatCurveCalculator.CurveType.POLYNOMIAL) {
            
            // Calculate the ratio between target and current level values
            const valueAtCurrent = StatCurveCalculator.calculate(currentValue, currentLevel, curveConfig);
            const valueAtTarget = StatCurveCalculator.calculate(currentValue, targetLevel, curveConfig);
            return valueAtTarget;
        }
        
        // For linear and sigmoid curves, use difference calculation
        const baseAtCurrent = StatCurveCalculator.calculate(0, currentLevel, curveConfig);
        const baseAtTarget = StatCurveCalculator.calculate(0, targetLevel, curveConfig);
        
        const curveDifference = baseAtTarget - baseAtCurrent;
        return currentValue + curveDifference;
    }

    /**
     * Get recommended stat distribution based on class template
     * @param {Object} classTemplate - Class template with growth config
     * @param {number} level - Current level
     * @param {number} availablePoints - Available stat points to distribute
     * @returns {Object} Recommended distribution { str, dex, int, vit, luk }
     */
    static getRecommendedDistribution(classTemplate, level, availablePoints) {
        const template = classTemplate?.statAllocationTemplate;
        if (!template) {
            // Default distribution
            return {
                str: Math.floor(availablePoints * 0.3),
                dex: Math.floor(availablePoints * 0.25),
                int: Math.floor(availablePoints * 0.25),
                vit: Math.floor(availablePoints * 0.15),
                luk: Math.floor(availablePoints * 0.05)
            };
        }

        const total = template.recommendedStr + template.recommendedDex + 
                     template.recommendedInt + template.recommendedVit + template.recommendedLuk;
        
        if (total <= 0) {
            return {
                str: 0, dex: 0, int: 0, vit: 0, luk: 0
            };
        }

        return {
            str: Math.round((template.recommendedStr / total) * availablePoints),
            dex: Math.round((template.recommendedDex / total) * availablePoints),
            int: Math.round((template.recommendedInt / total) * availablePoints),
            vit: Math.round((template.recommendedVit / total) * availablePoints),
            luk: Math.round((template.recommendedLuk / total) * availablePoints)
        };
    }
}

module.exports = StatCurveCalculator;
