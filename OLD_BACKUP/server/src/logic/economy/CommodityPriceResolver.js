/**
 * AAA CommodityPriceResolver
 * Pure component for calculating regional price multipliers based on extraction volume.
 */
class CommodityPriceResolver {
    constructor() {
        this.BASE_SUPPLY_THRESHOLD = 50; // Expected volume for "Normal" price (1.0x)
        this.SCARCITY_MULT_MAX = 1.5;    // Max +50% price if 0 supply
        this.SURPLUS_MULT_MIN = 0.8;     // Min -20% price if high supply
    }

    /**
     * Resolves price multiplier for an item in a region.
     * @param {number} volume24h - Extraction volume.
     * @returns {number} Multiplier.
     */
    resolveMultiplier(volume24h = 0) {
        if (volume24h <= 0) return this.SCARCITY_MULT_MAX;

        // 1. Scarcity Logic (0 < volume < 50)
        // Linear interpolation from 1.5x (0 volume) down to 1.0x (50 volume)
        if (volume24h < this.BASE_SUPPLY_THRESHOLD) {
            const ratio = volume24h / this.BASE_SUPPLY_THRESHOLD;
            return 1.0 + (this.SCARCITY_MULT_MAX - 1.0) * (1 - ratio);
        }

        // 2. Surplus Logic (volume >= 50)
        // Every additional 50 units reduces price by 5%, capped at 0.8
        const extraBlocks = Math.floor((volume24h - this.BASE_SUPPLY_THRESHOLD) / 50);
        const reduction = extraBlocks * 0.05;
        
        return parseFloat(Math.max(this.SURPLUS_MULT_MIN, 1.0 - reduction).toFixed(2));
    }
}

module.exports = new CommodityPriceResolver();
