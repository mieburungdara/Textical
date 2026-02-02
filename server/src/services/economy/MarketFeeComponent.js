/**
 * AAA MarketFeeComponent
 * Centralized logic for calculating taxes, listing fees, and duty costs.
 * Enhanced to support Faction-based tax discounts.
 */
class MarketFeeComponent {
    constructor() {
        this.BASE_LISTING_FEE_RATE = 0.05; // 5% Standard
        this.BASE_SALES_TAX_RATE = 0.10;   // 10% Imperial Tax
        this.FACTION_DISCOUNT_MULT = 0.50; // 50% off guild-side taxes
    }

    /**
     * Calculates the non-refundable fee for listing an item.
     */
    calculateListingFee(price, guildMarketTaxRate = 0, isFactionAlly = false) {
        let gTax = guildMarketTaxRate;
        if (isFactionAlly) gTax *= this.FACTION_DISCOUNT_MULT;

        const rate = this.BASE_LISTING_FEE_RATE + gTax;
        return Math.max(1, Math.floor(price * rate));
    }

    /**
     * Calculates total tax (Regional + Guild with optional discount).
     */
    calculateTotalSalesTax(price, guildMarketTaxRate = 0, isFactionAlly = false, regionalSalesTaxRate = null) {
        let gTax = guildMarketTaxRate;
        if (isFactionAlly) gTax *= this.FACTION_DISCOUNT_MULT;

        const baseRate = (regionalSalesTaxRate !== null) ? regionalSalesTaxRate : this.BASE_SALES_TAX_RATE;
        const rate = baseRate + gTax;
        return Math.floor(price * rate);
    }

    /**
     * Calculates specific guild revenue from a sale.
     */
    calculateGuildRevenue(price, guildMarketTaxRate = 0, isFactionAlly = false) {
        let gTax = guildMarketTaxRate;
        if (isFactionAlly) gTax *= this.FACTION_DISCOUNT_MULT;
        
        return Math.floor(price * gTax);
    }

    /**
     * Calculates final net profit for the seller.
     */
    calculateSellerNet(price, guildMarketTaxRate = 0, isFactionAlly = false, regionalSalesTaxRate = null) {
        const totalTax = this.calculateTotalSalesTax(price, guildMarketTaxRate, isFactionAlly, regionalSalesTaxRate);
        return price - totalTax;
    }
}

module.exports = new MarketFeeComponent();
