/**
 * Condition Types
 * Defines the types of conditions for conditional modifiers
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

module.exports = ConditionType;
