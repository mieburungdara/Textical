/**
 * AAA MarketFeeComponent
 * Centralized logic for calculating taxes, listing fees, and duty costs.
 * Enhanced to support Guild-based regional taxation.
 */
class MarketFeeComponent {
    constructor() {
        this.BASE_LISTING_FEE_RATE = 0.05; // 5% Standard
        this.BASE_SALES_TAX_RATE = 0.10;   // 10% Imperial Tax
    }

    /**
     * Calculates the non-refundable fee for listing an item.
     * Optionally includes guild-mandated listing surcharge.
     */
    calculateListingFee(price, guildMarketTaxRate = 0) {
        const rate = this.BASE_LISTING_FEE_RATE + guildMarketTaxRate;
        return Math.max(1, Math.floor(price * rate));
    }

    /**
     * Calculates total tax (Imperial + Guild).
     */
    calculateTotalSalesTax(price, guildMarketTaxRate = 0) {
        const rate = this.BASE_SALES_TAX_RATE + guildMarketTaxRate;
        return Math.floor(price * rate);
    }

    /**
     * Calculates specific guild revenue from a sale.
     */
    calculateGuildRevenue(price, guildMarketTaxRate = 0) {
        return Math.floor(price * guildMarketTaxRate);
    }

    /**
     * Calculates final net profit for the seller.
     */
    calculateSellerNet(price, guildMarketTaxRate = 0) {
        const totalTax = this.calculateTotalSalesTax(price, guildMarketTaxRate);
        return price - totalTax;
    }
}

module.exports = new MarketFeeComponent();