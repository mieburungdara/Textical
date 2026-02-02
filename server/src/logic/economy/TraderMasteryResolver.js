/**
 * AAA TraderMasteryResolver
 * Pure component for calculating trading tax discounts based on volume.
 */
class TraderMasteryResolver {
    constructor() {
        this.TIERS = [
            { count: 100, discount: 0.50 }, // 50% discount for legendary traders
            { count: 50,  discount: 0.30 }, // 30% discount
            { count: 10,  discount: 0.10 }  // 10% discount for beginners
        ];
    }

    /**
     * Resolves the tax discount multiplier based on sale count.
     * @param {number} totalSales - Total successful sales in history.
     * @returns {number} Multiplier (e.g., 0.9 for 10% discount).
     */
    resolveTaxMultiplier(totalSales = 0) {
        let discount = 0;

        for (const tier of this.TIERS) {
            if (totalSales >= tier.count) {
                discount = tier.discount;
                break;
            }
        }

        return 1.0 - discount;
    }
}

module.exports = new TraderMasteryResolver();
