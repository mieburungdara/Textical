/**
 * AAA Gathering Duration Calculator
 * Handles formula-based timing for various gathering types.
 */
class DurationCalculator {
    calculatePlantOrFishDuration(baseTime, statValue) {
        // Duration = ceil(BaseTime / max(0.5, statValue / 10))
        return Math.ceil(baseTime / Math.max(0.5, statValue / 10));
    }

    calculateMiningOrLumberingDuration(baseTime, hardness, str) {
        // Duration = ceil((BaseTime * Hardness) / max(0.5, STR / 10))
        const strFactor = Math.max(0.5, str / 10);
        let duration = Math.ceil((baseTime * hardness) / strFactor);
        return Math.max(5, Math.min(3600, duration)); // Clamped between 5s and 1hr
    }

    getToolMultiplier(tier) {
        const multipliers = [1.1, 1.25, 1.5, 2.0, 3.0];
        return multipliers[tier] || 1.0;
    }
}

module.exports = new DurationCalculator();
