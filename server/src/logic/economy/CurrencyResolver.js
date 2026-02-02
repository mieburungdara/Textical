/**
 * AAA CurrencyResolver
 * Pure component for handling dual-tier currency conversions.
 * Conversion Rate: 1,000,000 Silver = 1 Gold.
 */
class CurrencyResolver {
    constructor() {
        this.TIERS = ["silver", "gold"];
        this.RATE = 1000000;
    }

    /**
     * Converts a total amount of Silver into tiered denominations.
     * @param {number} totalSilver - The total base value.
     * @returns {Object} { gold, silver }
     */
    resolveTiers(totalSilver) {
        let remaining = totalSilver;
        const result = {};

        for (const tier of this.TIERS) {
            result[tier] = Number(BigInt(remaining) % BigInt(this.RATE));
            remaining = Math.floor(Number(BigInt(remaining) / BigInt(this.RATE)));
        }

        // Handle overflow into the final tier (gold)
        // If we have more than 1M gold, it stays in the 'gold' field.
        // Actually the loop handles it if the last tier is reached.
        
        return result;
    }

    /**
     * Converts tiered denominations back into total Silver base value.
     * @param {Object} tiers - { gold, silver }
     * @returns {number} Total Silver.
     */
    getTotalSilver(tiers) {
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