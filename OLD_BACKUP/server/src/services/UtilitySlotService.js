const BaseService = require('./BaseService');

/**
 * UtilitySlotService (v11.0)
 * Manages specialized functional slots (Storage, Garden, Workbench) in properties.
 * Provides tangible gameplay bonuses based on property tier.
 * 
 * @extends BaseService
 */
class UtilitySlotService extends BaseService {
    /**
     * Gets the total storage capacity bonus for a user in a specific region.
     * Tiered properties provide flat bonuses to regional inventory capacity.
     * 
     * @param {number} userId - ID of the user.
     * @param {number} regionId - ID of the region.
     * @returns {Promise<number>} Total extra storage slots.
     */
    async getRegionalStorageBonus(userId, regionId) {
        const properties = await this.db.propertyInstance.findMany({
            where: { userId, regionId },
            select: { tier: true }
        });

        // Tier 1: +5 slots, Tier 2: +15 slots, Tier 3: +50 slots
        const tierBonuses = { 1: 5, 2: 15, 3: 50 };
        
        return properties.reduce((total, prop) => total + (tierBonuses[prop.tier] || 0), 0);
    }

    /**
     * Returns the crafting efficiency multiplier for a specific property.
     * Higher tiers grant faster crafting or reduced resource consumption.
     * 
     * @param {number} propertyId - ID of the property.
     * @returns {Promise<number>} Efficiency multiplier (e.g., 1.25 for 25% better).
     */
    async getWorkbenchEfficiency(propertyId) {
        const property = await this.db.propertyInstance.findUnique({
            where: { id: propertyId },
            select: { tier: true }
        });

        if (!property) return 1.0;

        // Tier 1: 1.0x, Tier 2: 1.1x (+10%), Tier 3: 1.25x (+25%)
        const efficiencies = { 1: 1.0, 2: 1.1, 3: 1.25 };
        return efficiencies[property.tier] || 1.0;
    }

    /**
     * Returns the number of garden/harvest patches available for a property.
     * 
     * @param {number} propertyId - ID of the property.
     * @returns {Promise<number>} Number of patches.
     */
    async getGardenCapacity(propertyId) {
        const property = await this.db.propertyInstance.findUnique({
            where: { id: propertyId },
            select: { tier: true }
        });

        if (!property) return 0;

        // Tier 1: 0, Tier 2: 2 patches, Tier 3: 5 patches
        const capacities = { 1: 0, 2: 2, 3: 5 };
        return capacities[property.tier] || 0;
    }
}

module.exports = new UtilitySlotService();
