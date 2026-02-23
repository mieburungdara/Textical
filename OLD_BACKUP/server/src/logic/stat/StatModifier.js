const ConditionType = require('./ConditionType');

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
        this.id = config.id || `${this.source}_${Math.random().toString(36).slice(2, 11)}`;
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

module.exports = StatModifier;
