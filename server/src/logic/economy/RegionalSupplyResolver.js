/**
 * AAA RegionalSupplyResolver
 * Pure component for calculating stock multipliers based on regional data.
 */
class RegionalSupplyResolver {
    /**
     * Calculates a quantity multiplier for an item in a specific region.
     * @param {Object} region - RegionTemplate with resources.
     * @param {Object} item - ItemTemplate.
     * @returns {number} Multiplier (e.g., 1.5 for surplus).
     */
    calculateMultiplier(region, item) {
        let mult = 1.0;

        // 1. Resource Synergy (Surplus)
        const regionHasResource = region.resources && region.resources.some(r => r.itemId === item.id);
        if (regionHasResource) {
            mult += 0.5; // +50% stock if produced in region
        }

        // 2. Danger Level Scaling
        // Dangerous regions have less standard stock but maybe more specialized gear
        if (region.dangerLevel > 5) {
            if (item.category === "EQUIPMENT") mult += 0.2;
            if (item.category === "MATERIAL") mult -= 0.3;
        }

        // 3. Zone Type Scaling
        if (region.zoneType === "RED") {
            mult *= 0.8; // War zones have supply chain issues
        }

        return Math.max(0.1, mult);
    }
}

module.exports = new RegionalSupplyResolver();
