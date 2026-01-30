/**
 * AAA MarketFeeComponent
 * Centralized logic for calculating taxes, listing fees, and duty costs.
 */
class MarketFeeComponent {
    constructor() {
        this.BASE_LISTING_FEE_RATE = 0.05; // 5%
        this.BASE_SALES_TAX_RATE = 0.10;   // 10%
    }

    /**
     * Calculates the non-refundable fee for listing an item.
     */
    calculateListingFee(price) {
        return Math.max(1, Math.floor(price * this.BASE_LISTING_FEE_RATE));
    }

    /**
     * Calculates the tax deducted from the seller's final earnings.
     */
    calculateSalesTax(price) {
        return Math.floor(price * this.BASE_SALES_TAX_RATE);
    }

    /**
     * Calculates the final net amount the seller will receive.
     */
    calculateSellerNet(price) {
        const tax = this.calculateSalesTax(price);
        return price - tax;
    }
}

module.exports = new MarketFeeComponent();
