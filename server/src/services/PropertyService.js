const BaseService = require('./BaseService');
const PropertyPriceCalculator = require('../logic/economy/PropertyPriceCalculator');
const PropertyForeclosureProcessor = require('./property/PropertyForeclosureProcessor');

/**
 * PropertyService (v11.1 - SRP Refactored)
 * Manages regional housing, tiered upgrades, and social property features.
 * Delegates pricing to PropertyPriceCalculator and maintenance to ForeclosureProcessor.
 * 
 * @extends BaseService
 */
class PropertyService extends BaseService {
    /**
     * Purchase a plot of land in a region.
     * Uses Dynamic Pricing via PropertyPriceCalculator.
     * 
     * @param {number|any} userId - ID of the user purchasing the plot.
     * @param {number|any} regionId - ID of the region where the plot is located.
     * @returns {Promise<Object>} The created property instance.
     */
    async purchasePlot(userId, regionId) {
        return await this.runTransaction(async (/** @type {any} */ tx) => {
            const region = await tx.regionTemplate.findUnique({
                where: { id: regionId },
                select: { plotAvailability: true, rentCostMultiplier: true, zoneLevel: true }
            });

            if (!region || region.plotAvailability <= 0) {
                throw new Error("No plots available in this region.");
            }

            // Delegated Pricing Logic
            const finalPrice = PropertyPriceCalculator.calculatePlotPrice(region);

            const user = await tx.user.findUnique({ where: { id: userId }, select: { silver: true } });
            if (!user || user.silver < finalPrice) {
                throw new Error(`Insufficient funds. Need ${finalPrice} Silver.`);
            }

            // Update user balance and region availability
            await tx.user.update({
                where: { id: userId },
                data: { silver: { decrement: finalPrice } }
            });

            await tx.regionTemplate.update({
                where: { id: regionId },
                data: { 
                    plotAvailability: { decrement: 1 },
                    prestigePoints: { increment: 10 } 
                }
            });

            // Create property instance
            return await tx.propertyInstance.create({
                data: {
                    userId,
                    regionId,
                    propertyName: `Settlement of ${userId}`,
                    lastRentPaid: new Date()
                }
            });
        });
    }

    /**
     * Upgrade property tier (1 -> 2 -> 3).
     * 
     * @param {number|any} userId - Owner's user ID.
     * @param {number|any} propertyId - ID of the property to upgrade.
     * @returns {Promise<Object>} Updated property instance.
     */
    async upgradeTier(userId, propertyId) {
        return await this.runTransaction(async (/** @type {any} */ tx) => {
            const property = await tx.propertyInstance.findUnique({
                where: { id: propertyId }
            });

            if (!property || property.userId !== userId) {
                throw new Error("Property not found or access denied.");
            }

            if (property.tier >= 3) throw new Error("Property is already at maximum tier.");

            // Delegated Cost Calculation
            const upgradeCost = PropertyPriceCalculator.calculateUpgradeCost(property.tier);
            const user = await tx.user.findUnique({ where: { id: userId }, select: { silver: true } });

            if (!user || user.silver < upgradeCost) {
                throw new Error(`Insufficient funds for upgrade. Need ${upgradeCost} Silver.`);
            }

            await tx.user.update({
                where: { id: userId },
                data: { silver: { decrement: upgradeCost } }
            });

            return await tx.propertyInstance.update({
                where: { id: propertyId },
                data: { tier: property.tier + 1 }
            });
        });
    }

    /**
     * Update property name (Signage).
     * 
     * @param {number|any} userId - Owner's user ID.
     * @param {number|any} propertyId - ID of the property to rename.
     * @param {string|any} newName - New signage name.
     */
    async renameProperty(userId, propertyId, newName) {
        if (!newName || newName.length > 32) throw new Error("Invalid name (max 32 chars).");

        const property = await this.db.propertyInstance.findUnique({ where: { id: propertyId } });
        if (!property || property.userId !== userId) throw new Error("Access denied.");

        return await this.db.propertyInstance.update({
            where: { id: propertyId },
            data: { propertyName: newName }
        });
    }

    /**
     * Set bulletin board message.
     * 
     * @param {number|any} userId - Owner's user ID.
     * @param {number|any} propertyId - ID of the property.
     * @param {string|any} message - Message content.
     */
    async setBulletinMessage(userId, propertyId, message) {
        if (message && message.length > 140) throw new Error("Message too long (max 140 chars).");

        const property = await this.db.propertyInstance.findUnique({ where: { id: propertyId } });
        if (!property || property.userId !== userId) throw new Error("Access denied.");

        return await this.db.propertyInstance.update({
            where: { id: propertyId },
            data: { bulletinMessage: message }
        });
    }

    /**
     * Process all daily foreclosures for overdue properties.
     * DELEGATED to PropertyForeclosureProcessor.
     */
    async processForeclosures() {
        return await PropertyForeclosureProcessor.processAll();
    }

    /**
     * Foreclose a specific property.
     * DELEGATED to PropertyForeclosureProcessor.
     * @param {number|any} propertyId - ID of the property to foreclose.
     */
    async forecloseProperty(propertyId) {
        return await PropertyForeclosureProcessor.executeForeclosure(propertyId);
    }
}

module.exports = new PropertyService();

module.exports = new PropertyService();
