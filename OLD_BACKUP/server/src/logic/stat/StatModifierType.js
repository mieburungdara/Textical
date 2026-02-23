/**
 * Stat Modifier Types
 * Defines the types of modifiers that can be applied to stats
 * @enum {number}
 */
const StatModifierType = {
    FLAT: 0,           // Direct addition: +10
    PERCENT_ADD: 1,    // Percentage addition: +10% (adds to base percentage)
    PERCENT_MULT: 2    // Multiplier: x1.1 (multiplies the total)
};

module.exports = StatModifierType;
