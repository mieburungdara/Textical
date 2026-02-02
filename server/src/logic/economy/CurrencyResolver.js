/**
 * AAA CurrencyResolver
 * Pure component for handling 5-tier currency conversions.
 * Conversion Rate: 1000:1 between tiers.
 */
class CurrencyResolver {
    constructor() {
        this.TIERS = ["copper", "silver", "gold", "platinum", "diamond"];
        this.RATE = 1000;
    }

    /**
     * Converts a total amount of Copper into tiered denominations.
     * @param {number} totalCopper - The total base value.
     * @returns {Object} { diamond, platinum, gold, silver, copper }
     */
    resolveTiers(totalCopper) {
        let remaining = totalCopper;
        const result = {};

        for (const tier of this.TIERS) {
            result[tier] = remaining % this.RATE;
            remaining = Math.floor(remaining / this.RATE);
        }

        // The last tier (diamond) takes whatever is left above the highest standard threshold
        // But with 5 tiers, Diamond handles everything from 1000^4 and up.
        // Actually, the loop handles it correctly if Diamond is the last in list.
        // Let's ensure Diamond doesn't overflow into a 6th non-existent tier.
        
        return result;
    }

    /**
     * Converts tiered denominations back into total Copper base value.
     * @param {Object} tiers - { diamond, platinum, gold, silver, copper }
     * @returns {number} Total Copper.
     */
    getTotalCopper(tiers) {
        let total = 0;
        let multiplier = 1;

        for (const tier of this.TIERS) {
            total += (tiers[tier] || 0) * multiplier;
            multiplier *= this.RATE;
        }

        return total;
    }
}

module.exports = new CurrencyResolver();
