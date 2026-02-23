const StatModifierType = require('./StatModifierType');

/**
 * StatBreakdownBuilder - Constructs a detailed breakdown of stat calculations.
 */
class StatBreakdownBuilder {
    /**
     * Build a detailed breakdown object.
     * @param {Object} stat - The EnhancedStat instance data.
     * @param {Object} context - Context for conditional evaluation.
     * @returns {Object} Breakdown object.
     */
    static build(stat, context = {}) {
        const breakdown = {
            statName: stat.name,
            baseValue: stat.baseValue,
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
                min: stat.minValue,
                max: stat.maxValue,
                softCap: stat.softCap,
                isExempt: stat.isExempt,
                appliedSoftCap: false,
                appliedHardCap: false
            }
        };

        const allModifiers = [...stat.modifiers, ...stat.conditionalModifiers];

        allModifiers.forEach(mod => {
            const isActive = !mod.isConditional || mod.isConditionMet(context);
            const typeKey = this._getTypeKey(mod.type);
            
            const modData = {
                id: mod.id,
                source: mod.source,
                value: mod.value,
                type: typeKey,
                priority: mod.priority,
                condition: mod.condition,
                isActive: isActive
            };

            if (mod.isConditional) {
                if (isActive) {
                    breakdown.activeConditionalModifiers.push(modData);
                } else {
                    breakdown.inactiveConditionalModifiers.push(modData);
                }
            } else {
                breakdown.modifiers[this._getGroupKey(mod.type)].push(modData);
            }
        });

        // Calculation logic
        let currentValue = stat.baseValue;
        
        const flatSum = breakdown.modifiers.flat.reduce((sum, m) => sum + m.value, 0);
        
        const percentAddSum = breakdown.modifiers.percentAdd.reduce((sum, m) => sum + m.value, 0) +
            breakdown.activeConditionalModifiers
                .filter(m => m.type === 'PERCENT_ADD')
                .reduce((sum, m) => sum + m.value, 0);
                
        const percentMultProduct = [
            ...breakdown.modifiers.percentMult,
            ...breakdown.activeConditionalModifiers.filter(m => m.type === 'PERCENT_MULT')
        ].reduce((product, m) => product * m.value, 1.0);

        breakdown.intermediateValues = {
            afterFlat: currentValue + flatSum,
            afterPercentAdd: (currentValue + flatSum) * (1 + percentAddSum),
            afterPercentMult: (currentValue + flatSum) * (1 + percentAddSum) * percentMultProduct
        };

        currentValue = breakdown.intermediateValues.afterPercentMult;

        // Caps
        if (stat.softCap !== null && currentValue > stat.softCap && !stat.isExempt) {
            const overThreshold = currentValue - stat.softCap;
            const reducedAmount = overThreshold * (1 - stat.softCapFactor);
            currentValue = stat.softCap + reducedAmount;
            breakdown.caps.appliedSoftCap = true;
            breakdown.caps.softCapReducedBy = overThreshold * stat.softCapFactor;
        }

        if (!stat.isExempt) {
            if (currentValue < stat.minValue) {
                breakdown.caps.appliedHardCap = 'min';
                currentValue = stat.minValue;
            } else if (currentValue > stat.maxValue) {
                breakdown.caps.appliedHardCap = 'max';
                currentValue = stat.maxValue;
            }
        }

        breakdown.finalValue = currentValue;
        return breakdown;
    }

    /** @private */
    static _getTypeKey(type) {
        return Object.keys(StatModifierType)[type];
    }

    /** @private */
    static _getGroupKey(type) {
        if (type === StatModifierType.FLAT) return 'flat';
        if (type === StatModifierType.PERCENT_ADD) return 'percentAdd';
        return 'percentMult';
    }
}

module.exports = StatBreakdownBuilder;
