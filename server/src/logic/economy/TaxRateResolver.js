/**
 * AAA TaxRateResolver
 * Pure component for calculating regional market tax rates.
 */
class TaxRateResolver {
    constructor() {
        this.BASE_TAX_RATE = 0.10;      // 10%
        this.WAR_TAX_PENALTY = 0.05;    // +5% during War
        this.MIN_TAX_RATE = 0.02;       // 2% absolute minimum
    }

    /**
     * Resolves the final tax rate for a region.
     * @param {boolean} isAtWar - Whether the region's owner is at war.
     * @param {number} infrastructureBonus - Reduction from guild facilities (e.g., 0.02 for 2%).
     * @returns {number} Final tax rate.
     */
    resolve(isAtWar, infrastructureBonus = 0) {
        let rate = this.BASE_TAX_RATE;

        // 1. War Penalty
        if (isAtWar) {
            rate += this.WAR_TAX_PENALTY;
        }

        // 2. Infrastructure Bonus (Reduction)
        rate -= infrastructureBonus;

        return parseFloat(Math.max(this.MIN_TAX_RATE, rate).toFixed(4));
    }
}

module.exports = new TaxRateResolver();
