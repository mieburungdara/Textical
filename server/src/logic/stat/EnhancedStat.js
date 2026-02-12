const StatModifierType = require('./StatModifierType');
const GrowthCurveType = require('./GrowthCurveType');
const StatModifier = require('./StatModifier');

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
            this.conditionalModifiers.sort((a, b) => b.priority - a.priority);
        } else {
            this.modifiers.push(modifier);
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
     * @param {Object} context - Context for conditional modifier evaluation
     * @returns {number} Final calculated value
     */
    getValue(context = {}) {
        if (this._cacheValid && !context.forceRecalculate) {
            return this._cachedValue;
        }

        let value = this.baseValue;

        const activeModifiers = [
            ...this.modifiers,
            ...this.conditionalModifiers.filter(m => m.isConditionMet(context))
        ];

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

        flatModifiers.forEach(mod => {
            value += mod.value;
        });

        const percentAddTotal = percentAddModifiers.reduce((sum, mod) => sum + mod.value, 0);
        value = value * (1 + percentAddTotal);

        const percentMultTotal = percentMultModifiers.reduce((product, mod) => product * mod.value, 1.0);
        value = value * percentMultTotal;

        if (this.softCap !== null && value > this.softCap && !this.isExempt) {
            const overThreshold = value - this.softCap;
            const reducedAmount = overThreshold * (1 - this.softCapFactor);
            value = this.softCap + reducedAmount;
        }

        if (!this.isExempt) {
            value = Math.max(this.minValue, Math.min(value, this.maxValue));
        }

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

        if (this.softCap !== null && currentValue > this.softCap && !this.isExempt) {
            const overThreshold = currentValue - this.softCap;
            const reducedAmount = overThreshold * (1 - this.softCapFactor);
            currentValue = this.softCap + reducedAmount;
            breakdown.caps.appliedSoftCap = true;
            breakdown.caps.softCapReducedBy = overThreshold * this.softCapFactor;
        }

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

        const tempStat = new EnhancedStat(growthValue, {
            minValue: this.minValue,
            maxValue: this.maxValue,
            softCap: this.softCap,
            softCapFactor: this.softCapFactor,
            isExempt: this.isExempt
        });

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

module.exports = EnhancedStat;
