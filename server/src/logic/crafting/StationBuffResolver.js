/**
 * AAA StationBuffResolver
 * Pure component for calculating regional crafting station bonuses based on resource surplus.
 */
class StationBuffResolver {
    constructor() {
        this.SURPLUS_THRESHOLD_LOW = 100; // 10% speed boost
        this.SURPLUS_THRESHOLD_HIGH = 500; // 30% speed boost
    }

    /**
     * Resolves the speed multiplier for crafting based on material volume.
     * @param {number} volume24h - Extraction volume of the material.
     * @returns {number} Multiplier (e.g., 0.9 for 10% faster).
     */
    resolveSpeedMultiplier(volume24h = 0) {
        if (volume24h >= this.SURPLUS_THRESHOLD_HIGH) return 0.7; // 30% faster
        if (volume24h >= this.SURPLUS_THRESHOLD_LOW) return 0.9; // 10% faster
        return 1.0;
    }
}

module.exports = new StationBuffResolver();
