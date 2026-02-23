const EnhancedStat = require('./EnhancedStat');
const StatModifier = require('./StatModifier');

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

module.exports = StatSet;
