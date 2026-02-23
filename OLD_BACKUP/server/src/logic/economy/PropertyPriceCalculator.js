const PropertyPriceCalculator = {
    /**
     * Calculate final purchase price for a plot.
     * @param {any} region - Region data (zoneLevel, plotAvailability, rentCostMultiplier).
     * @returns {number} Final price in Silver.
     */
    calculatePlotPrice(region) {
        // Base Price: Higher zones = More expensive
        const basePrice = (region.zoneLevel + 1) * 2000; 
        
        // Scarcity Factor: Citadels/Villages logic
        let scarcityFactor = 1.0;
        if (region.plotAvailability < 5) scarcityFactor = 2.0;
        else if (region.plotAvailability < 10) scarcityFactor = 1.5;

        return Math.floor(basePrice * region.rentCostMultiplier * scarcityFactor);
    },

    /**
     * Calculate upgrade cost based on current tier.
     * @param {number} currentTier - Current property tier (1 or 2).
     * @returns {number} Upgrade cost in Silver.
     */
    calculateUpgradeCost(currentTier) {
        if (currentTier === 1) return 10000;
        if (currentTier === 2) return 35000;
        return 0; // Tier 3 is max
    }
};

module.exports = PropertyPriceCalculator;
