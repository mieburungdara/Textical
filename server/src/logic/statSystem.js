/**
 * Enhanced Stat System
 * Provides advanced stat management with caps, growth curves, conditional modifiers,
 * and support for chaining operations.
 */

/**
 * Modifier types for stat calculations
 * @enum {number}
 */
const StatModifierType = {
    FLAT: 0,           // Direct addition: +10
    PERCENT_ADD: 1,    // Percentage addition: +10% (adds to base percentage)
    PERCENT_MULT: 2    // Multiplier: x1.1 (multiplies the total)
};

/**
 * Growth curve types
 * @enum {string}
 */
const GrowthCurveType = {
    LINEAR: 'linear',
    EXPONENTIAL: 'exponential',
    SIGMOID: 'sigmoid',
    POLYNOMIAL: 'polynomial',
    LOGARITHMIC: 'logarithmic'
};

/**
 * Condition types for conditional modifiers
 * @enum {string}
 */
const ConditionType = {
    STAT_THRESHOLD: 'STAT_THRESHOLD',
    LEVEL_MIN: 'LEVEL_MIN',
    LEVEL_MAX: 'LEVEL_MAX',
    CLASS: 'CLASS',
    ELEMENT: 'ELEMENT',
    BUFF_ACTIVE: 'BUFF_ACTIVE',
    TIME_OF_DAY: 'TIME_OF_DAY',
    REGION_TYPE: 'REGION_TYPE'
};

/**
 * StatModifier - Represents a single modifier to a stat
 */
class StatModifier {
    /**
     * @param {Object} config - Modifier configuration
     * @param {number} config.value - Modifier value
     * @param {number} config.type - Modifier type (StatModifierType)
     * @param {string} config.source - Source of the modifier
     * @param {number} config.priority - Priority for ordering (higher = applied first)
     * @param {Object} [config.condition] - Condition for the modifier to be active
     * @param {boolean} config.isConditional - Whether this is a conditional modifier
     */
    constructor(config) {
        this.value = config.value;
        this.type = config.type;
        this.source = config.source;
        this.priority = config.priority || 0;
        this.condition = config.condition || null;
        this.isConditional = config.isConditional || false;
        this.id = config.id || `${this.source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Check if this modifier's condition is met
     * @param {Object} context - Context object with evaluation data
     * @returns {boolean} True if condition is met or no condition
     */
    isConditionMet(context = {}) {
        if (!this.condition) return true;

        const condition = this.condition;
        switch (condition.type) {
            case ConditionType.STAT_THRESHOLD:
                const statValue = context.stats?.[condition.statKey] || 0;
                return this._compareValues(statValue, condition.operator || '>=', condition.threshold);
            
            case ConditionType.LEVEL_MIN:
                return (context.level || 1) >= condition.minLevel;
            
            case ConditionType.LEVEL_MAX:
                return (context.level || 1) <= condition.maxLevel;
            
            case ConditionType.CLASS:
                return context.combatClassId === condition.classId;
            
            case ConditionType.ELEMENT:
                return context.elementalAffinity?.some(a => a.elementTypeId === condition.element);
            
            case ConditionType.BUFF_ACTIVE:
                return context.activeBuffs?.some(b => b.name === condition.buffName);
            
            case ConditionType.TIME_OF_DAY:
                return context.currentHour >= condition.startHour && 
                       context.currentHour < condition.endHour;
            
            case ConditionType.REGION_TYPE:
                return context.regionType === condition.regionType;
            
            default:
                return true;
        }
    }

    /**
     * Compare values with operator
     * @private
     */
    _compareValues(value, operator, threshold) {
        switch (operator) {
            case '>=': return value >= threshold;
            case '<=': return value <= threshold;
            case '>': return value > threshold;
            case '<': return value < threshold;
            case '==': return value === threshold;
            case '!=': return value !== threshold;
            default: return value >= threshold;
        }
    }
}

/**
 * EnhancedStat - Enhanced stat with caps, curves, and chaining support
 */
class EnhancedStat {
    /**
     * Create an EnhancedStat
     * @param {number} baseValue - Base value of the stat
     * @param {Object} config - Configuration options
     */
    constructor(baseValue = 0, config = {}) {
        this.baseValue = baseValue;
        this.modifiers = [];
        this.conditionalModifiers = [];
        
        // Cap configuration
        this.minValue = config.minValue ?? -Infinity;
        this.maxValue = config.maxValue ?? Infinity;
        
        // Soft cap configuration for diminishing returns
        this.softCap = config.softCap ?? null;
        this.softCapFactor = config.softCapFactor ?? 0.1;
        
        // Growth curve configuration
        this.curveType = config.curveType ?? GrowthCurveType.LINEAR;
        this.curveFactor = config.curveFactor ?? 1.0;
        this.curveMidpoint = config.curveMidpoint ?? 50;
        this.curveSteepness = config.curveSteepness ?? 0.1;
        
        // Exempt from caps
        this.isExempt = config.isExempt ?? false;
        
        // Name for debugging
        this.name = config.name ?? 'stat';
        
        // Cache for calculated values
        this._cachedValue = null;
        this._cacheValid = false;
        this._breakdownCache = null;
    }

    /**
     * Add a modifier to this stat
     * @param {StatModifier|Object} modifier - Modifier to add
     * @returns {EnhancedStat} this (for chaining)
     */
    addModifier(modifier) {
        if (!(modifier instanceof StatModifier)) {
            modifier = new StatModifier(modifier);
        }

        if (modifier.isConditional) {
            this.conditionalModifiers.push(modifier);
            // Sort conditional modifiers by priority (higher first)
            this.conditionalModifiers.sort((a, b) => b.priority - a.priority);
        } else {
            this.modifiers.push(modifier);
            // Sort modifiers by priority (higher first)
            this.modifiers.sort((a, b) => b.priority - a.priority);
        }

        this._invalidateCache();
        return this;
    }

    /**
     * Add multiple modifiers at once
     * @param {Array} modifiers - Array of modifiers to add
     * @returns {EnhancedStat} this (for chaining)
     */
    addModifiers(modifiers) {
        modifiers.forEach(mod => this.addModifier(mod));
        return this;
    }

    /**
     * Remove a modifier by ID
     * @param {string} modifierId - ID of the modifier to remove
     * @returns {EnhancedStat} this (for chaining)
     */
    removeModifier(modifierId) {
        this.modifiers = this.modifiers.filter(m => m.id !== modifierId);
        this.conditionalModifiers = this.conditionalModifiers.filter(m => m.id !== modifierId);
        this._invalidateCache();
        return this;
    }

    /**
     * Clear all modifiers
     * @param {boolean} keepBase - Keep the base value
     * @returns {EnhancedStat} this (for chaining)
     */
    clearModifiers(keepBase = true) {
        this.modifiers = [];
        this.conditionalModifiers = [];
        this._invalidateCache();
        return this;
    }

    /**
     * Set the base value
     * @param {number} value - New base value
     * @returns {EnhancedStat} this (for chaining)
     */
    setBase(value) {
        this.baseValue = value;
        this._invalidateCache();
        return this;
    }

    /**
     * Set cap values
     * @param {Object} caps - Cap configuration
     * @param {number} [caps.min] - Minimum value
     * @param {number} [caps.max] - Maximum value
     * @param {Object} [caps.soft] - Soft cap configuration
     * @returns {EnhancedStat} this (for chaining)
     */
    setCaps(caps) {
        if (caps.min !== undefined) this.minValue = caps.min;
        if (caps.max !== undefined) this.maxValue = caps.max;
        if (caps.soft) {
            this.softCap = caps.soft.threshold ?? this.softCap;
            this.softCapFactor = caps.soft.factor ?? this.softCapFactor;
        }
        this._invalidateCache();
        return this;
    }

    /**
     * Set growth curve configuration
     * @param {Object} curveConfig - Curve configuration
     * @param {string} [curveConfig.type] - Curve type
     * @param {number} [curveConfig.factor] - Growth factor
     * @returns {EnhancedStat} this (for chaining)
     */
    setGrowthCurve(curveConfig) {
        if (curveConfig.type) this.curveType = curveConfig.type;
        if (curveConfig.factor) this.curveFactor = curveConfig.factor;
        if (curveConfig.midpoint) this.curveMidpoint = curveConfig.midpoint;
        if (curveConfig.steepness) this.curveSteepness = curveConfig.steepness;
        this._invalidateCache();
        return this;
    }

    /**
     * Calculate the final stat value with all modifiers
     * This method implements the layered modifier calculation:
     * 1. Collect all active modifiers (regular + conditional)
     * 2. Separate modifiers by type (FLAT, PERCENT_ADD, PERCENT_MULT)
     * 3. Apply in order: flat → percent_add → percent_mult
     * 4. Apply soft cap (diminishing returns) if value exceeds threshold
     * 5. Apply hard caps (min/max limits)
     * 
     * @param {Object} context - Context for conditional modifier evaluation
     * @param {Object} [context.stats] - Current stat values for threshold checks
     * @param {number} [context.level] - Hero level for level-based conditions
     * @param {string} [context.combatClassId] - Combat class for class conditions
     * @param {Array} [context.activeBuffs] - Active buffs for buff conditions
     * @param {number} [context.currentHour] - Current hour for time conditions
     * @param {string} [context.regionType] - Current region for region conditions
     * @returns {number} Final calculated value after all modifiers and caps
     */
    getValue(context = {}) {
        // Check cache first - avoid recalculation if valid and not forced
        if (this._cacheValid && !context.forceRecalculate) {
            return this._cachedValue;
        }

        // Start with base value
        let value = this.baseValue;

        // Collect all active modifiers (regular + conditional that meet conditions)
        const activeModifiers = [
            ...this.modifiers,
            ...this.conditionalModifiers.filter(m => m.isConditionMet(context))
        ];

        // Separate modifiers by type for proper calculation order
        // FLAT: Direct addition (+10)
        // PERCENT_ADD: Percentage addition (+10% adds to base)
        // PERCENT_MULT: Multiplier (x1.1 multiplies total)
        const flatModifiers = [];
        const percentAddModifiers = [];
        const percentMultModifiers = [];

        activeModifiers.forEach(mod => {
            if (mod.type === StatModifierType.FLAT) {
                flatModifiers.push(mod);
            } else if (mod.type === StatModifierType.PERCENT_ADD) {
                percentAddModifiers.push(mod);
            } else if (mod.type === StatModifierType.PERCENT_MULT) {
                percentMultModifiers.push(mod);
            }
        });

        // Apply flat modifiers - simple addition
        flatModifiers.forEach(mod => {
            value += mod.value;
        });

        // Apply percentage additions - sum all percentages first, then apply
        // Example: 100 base + 10% + 20% = 100 * (1 + 0.1 + 0.2) = 130
        const percentAddTotal = percentAddModifiers.reduce((sum, mod) => sum + mod.value, 0);
        value = value * (1 + percentAddTotal);

        // Apply multipliers - multiply all multipliers together
        // Example: 130 * 1.1 * 1.2 = 171.6
        const percentMultTotal = percentMultModifiers.reduce((product, mod) => product * mod.value, 1.0);
        value = value * percentMultTotal;

        // Apply soft cap (diminishing returns) if value exceeds threshold
        // Formula: value = threshold + (excess * (1 - softCapFactor))
        // Example: softCap=100, value=150, factor=0.1
        // Result: 100 + (50 * 0.9) = 100 + 45 = 145
        if (this.softCap !== null && value > this.softCap && !this.isExempt) {
            const overThreshold = value - this.softCap;
            const reducedAmount = overThreshold * (1 - this.softCapFactor);
            value = this.softCap + reducedAmount;
        }

        // Apply hard caps - absolute minimum and maximum limits
        if (!this.isExempt) {
            value = Math.max(this.minValue, Math.min(value, this.maxValue));
        }

        // Cache the result for performance
        this._cachedValue = value;
        this._cacheValid = true;

        return value;
    }

    /**
     * Get detailed breakdown of stat calculation
     * @param {Object} context - Context for conditional evaluation
     * @returns {Object} Detailed breakdown object
     */
    getDetailedBreakdown(context = {}) {
        if (this._breakdownCache && !context.forceRecalculate) {
            return this._breakdownCache;
        }

        const value = this.baseValue;
        const breakdown = {
            statName: this.name,
            baseValue: this.baseValue,
            modifiers: {
                flat: [],
                percentAdd: [],
                percentMult: []
            },
            activeConditionalModifiers: [],
            inactiveConditionalModifiers: [],
            intermediateValues: {},
            finalValue: 0,
            caps: {
                min: this.minValue,
                max: this.maxValue,
                softCap: this.softCap,
                isExempt: this.isExempt,
                appliedSoftCap: false,
                appliedHardCap: false
            }
        };

        // Process all modifiers
        [...this.modifiers, ...this.conditionalModifiers].forEach(mod => {
            const isActive = !mod.isConditional || mod.isConditionMet(context);
            const targetArray = mod.isConditional 
                ? (isActive ? breakdown.activeConditionalModifiers : breakdown.inactiveConditionalModifiers)
                : breakdown.modifiers[mod.type === StatModifierType.FLAT ? 'flat' : 
                    mod.type === StatModifierType.PERCENT_ADD ? 'percentAdd' : 'percentMult'];

            targetArray.push({
                id: mod.id,
                source: mod.source,
                value: mod.value,
                type: Object.keys(StatModifierType)[mod.type],
                priority: mod.priority,
                condition: mod.condition,
                isActive: isActive
            });
        });

        // Calculate intermediate values
        let currentValue = this.baseValue;
        const flatSum = breakdown.modifiers.flat.reduce((sum, m) => sum + m.value, 0);
        const percentAddSum = breakdown.modifiers.percentAdd.reduce((sum, m) => sum + m.value, 0) +
            breakdown.activeConditionalModifiers.filter(m => m.type === StatModifierType.PERCENT_ADD)
                .reduce((sum, m) => sum + m.value, 0);
        const percentMultProduct = [
            ...breakdown.modifiers.percentMult,
            ...breakdown.activeConditionalModifiers.filter(m => m.type === StatModifierType.PERCENT_MULT)
        ].reduce((product, m) => product * m.value, 1.0);

        breakdown.intermediateValues = {
            afterFlat: currentValue + flatSum,
            afterPercentAdd: (currentValue + flatSum) * (1 + percentAddSum),
            afterPercentMult: (currentValue + flatSum) * (1 + percentAddSum) * percentMultProduct
        };

        currentValue = breakdown.intermediateValues.afterPercentMult;

        // Apply soft cap
        if (this.softCap !== null && currentValue > this.softCap && !this.isExempt) {
            const overThreshold = currentValue - this.softCap;
            const reducedAmount = overThreshold * (1 - this.softCapFactor);
            currentValue = this.softCap + reducedAmount;
            breakdown.caps.appliedSoftCap = true;
            breakdown.caps.softCapReducedBy = overThreshold * this.softCapFactor;
        }

        // Apply hard caps
        if (!this.isExempt) {
            if (currentValue < this.minValue) {
                breakdown.caps.appliedHardCap = 'min';
                currentValue = this.minValue;
            } else if (currentValue > this.maxValue) {
                breakdown.caps.appliedHardCap = 'max';
                currentValue = this.maxValue;
            }
        }

        breakdown.finalValue = currentValue;

        this._breakdownCache = breakdown;
        return breakdown;
    }

    /**
     * Get value at a specific level with growth curve
     * @param {number} level - Target level
     * @param {Object} options - Options for growth calculation
     * @returns {number} Value at the specified level
     */
    getValueAtLevel(level, options = {}) {
        const baseLevel = options.baseLevel || 1;
        const growthMultiplier = options.growthMultiplier || this.curveFactor;
        
        const levelDiff = level - baseLevel;
        if (levelDiff <= 0) return this.getValue();

        let growthValue = 0;

        switch (this.curveType) {
            case GrowthCurveType.LINEAR:
                growthValue = this.baseValue + (this.curveFactor * levelDiff);
                break;
            
            case GrowthCurveType.EXPONENTIAL:
                growthValue = this.baseValue * Math.pow(this.curveFactor, levelDiff);
                break;
            
            case GrowthCurveType.SIGMOID:
                const sigmoidValue = 1 / (1 + Math.exp(-this.curveSteepness * (level - this.curveMidpoint)));
                growthValue = this.baseValue * (1 + (this.curveFactor - 1) * sigmoidValue);
                break;
            
            case GrowthCurveType.POLYNOMIAL:
                growthValue = this.baseValue + (this.curveFactor * Math.pow(levelDiff, options.power || 2));
                break;
            
            case GrowthCurveType.LOGARITHMIC:
                growthValue = this.baseValue + (this.curveFactor * Math.log(levelDiff + 1));
                break;
            
            default:
                growthValue = this.baseValue + (this.curveFactor * levelDiff);
        }

        // Create temporary stat for calculation
        const tempStat = new EnhancedStat(growthValue, {
            minValue: this.minValue,
            maxValue: this.maxValue,
            softCap: this.softCap,
            softCapFactor: this.softCapFactor,
            isExempt: this.isExempt
        });

        // Add non-growth modifiers
        this.modifiers.forEach(m => tempStat.addModifier(m));
        this.conditionalModifiers.forEach(m => tempStat.addModifier(m));

        return tempStat.getValue();
    }

    /**
     * Clone this stat
     * @returns {EnhancedStat} Cloned stat
     */
    clone() {
        const cloned = new EnhancedStat(this.baseValue, {
            minValue: this.minValue,
            maxValue: this.maxValue,
            softCap: this.softCap,
            softCapFactor: this.softCapFactor,
            curveType: this.curveType,
            curveFactor: this.curveFactor,
            curveMidpoint: this.curveMidpoint,
            curveSteepness: this.curveSteepness,
            isExempt: this.isExempt,
            name: this.name
        });

        // Copy modifiers
        this.modifiers.forEach(m => cloned.addModifier(m));
        this.conditionalModifiers.forEach(m => cloned.addModifier(m));

        return cloned;
    }

    /**
     * Invalidate cached value
     * @private
     */
    _invalidateCache() {
        this._cacheValid = false;
        this._breakdownCache = null;
    }

    /**
     * Get count of modifiers
     * @returns {number} Total modifier count
     */
    getModifierCount() {
        return this.modifiers.length + this.conditionalModifiers.length;
    }

    /**
     * Get all modifier sources
     * @returns {Array} Array of unique sources
     */
    getModifierSources() {
        const sources = new Set();
        this.modifiers.forEach(m => sources.add(m.source));
        this.conditionalModifiers.forEach(m => sources.add(m.source));
        return Array.from(sources);
    }

    /**
     * Check if stat has any modifiers
     * @returns {boolean} True if has modifiers
     */
    hasModifiers() {
        return this.getModifierCount() > 0;
    }
}

/**
 * StatSet - Groups multiple stats together for equipment sets
 */
class StatSet {
    /**
     * Create a stat set
     * @param {string} name - Name of the set
     */
    constructor(name) {
        this.name = name;
        this.stats = new Map();
    }

    /**
     * Add a stat to the set
     * @param {string} key - Stat key
     * @param {EnhancedStat|number} stat - Stat value or EnhancedStat object
     * @param {Object} config - Configuration for new EnhancedStat
     * @returns {StatSet} this (for chaining)
     */
    addStat(key, stat, config = {}) {
        if (!(stat instanceof EnhancedStat)) {
            stat = new EnhancedStat(stat, config);
        }
        this.stats.set(key, stat);
        return this;
    }

    /**
     * Get a stat by key
     * @param {string} key - Stat key
     * @returns {EnhancedStat|null} The stat or null
     */
    getStat(key) {
        return this.stats.get(key) || null;
    }

    /**
     * Get all stats as plain object
     * @param {Object} context - Context for conditional evaluation
     * @returns {Object} Plain object with stat values
     */
    toObject(context = {}) {
        const result = {};
        this.stats.forEach((stat, key) => {
            result[key] = stat.getValue(context);
        });
        return result;
    }

    /**
     * Get detailed breakdown for all stats
     * @param {Object} context - Context for conditional evaluation
     * @returns {Object} Breakdown object
     */
    getDetailedBreakdown(context = {}) {
        const breakdown = {};
        this.stats.forEach((stat, key) => {
            breakdown[key] = stat.getDetailedBreakdown(context);
        });
        return breakdown;
    }

    /**
     * Apply modifiers from another stat set
     * @param {StatSet} otherSet - Source stat set
     * @param {number} multiplier - Multiplier for the bonus (e.g., 0.5 for 2-piece bonus)
     */
    applyBonus(otherSet, multiplier = 1) {
        otherSet.stats.forEach((stat, key) => {
            const currentStat = this.stats.get(key);
            if (currentStat) {
                // Merge modifiers
                stat.modifiers.forEach(mod => {
                    const scaledMod = new StatModifier({
                        ...mod,
                        value: mod.value * multiplier,
                        source: `${mod.source} (Set Bonus)`
                    });
                    currentStat.addModifier(scaledMod);
                });
            }
        });
    }
}

// Export all classes
module.exports = {
    StatModifier,
    StatModifierType,
    GrowthCurveType,
    ConditionType,
    EnhancedStat,
    StatSet
};
