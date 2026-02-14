const BaseService = require('./BaseService');

/**
 * RegionalEconomicService (v11.0)
 * Manages regional prestige and economic buffs like "Economic Hub".
 * 
 * @extends BaseService
 */
class RegionalEconomicService extends BaseService {
    /**
     * Updates and evaluates the regional economic status based on property density.
     * 
     * @param {number} regionId - ID of the region to evaluate.
     * @returns {Promise<boolean>} True if the region qualifies as an Economic Hub.
     */
    async updateRegionalStatus(regionId) {
        const region = await this.db.regionTemplate.findUnique({
            where: { id: regionId },
            include: { 
                _count: { select: { properties: true } }
            }
        });

        if (!region) return false;

        const totalPlotsUsed = region._count.properties;
        const totalCapacity = totalPlotsUsed + region.plotAvailability;
        
        if (totalCapacity === 0) return false;

        const occupancyRate = totalPlotsUsed / totalCapacity;

        // If occupancy > 80%, the region status could be used by other services (market, taxes)
        return occupancyRate > 0.8;
    }

    /**
     * Calculates the regional tax discount provided by high prestige.
     * Every 100 prestige points grant a small discount to regional taxes.
     * 
     * @param {number} regionId - ID of the region.
     * @returns {Promise<number>} Tax discount multiplier (e.g., 0.02 for 2% off).
     */
    async getRegionalTaxDiscount(regionId) {
        const region = await this.db.regionTemplate.findUnique({
            where: { id: regionId },
            select: { prestigePoints: true }
        });

        if (!region) return 0;

        // MAX 5% discount (0.05) reached at 1000 prestige points.
        return Math.min(0.05, (region.prestigePoints / 100) * 0.005);
    }
}

module.exports = new RegionalEconomicService();
