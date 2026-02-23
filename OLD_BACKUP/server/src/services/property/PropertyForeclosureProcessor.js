const prisma = require('../../db');

/**
 * PropertyForeclosureProcessor
 * Handles batch processing for overdue properties and individual foreclosure transactions.
 */
class PropertyForeclosureProcessor {
    /**
     * Process all daily foreclosures for overdue properties.
     * @returns {Promise<number>} Number of foreclosed properties.
     */
    static async processAll() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const overdueProperties = await prisma.propertyInstance.findMany({
            where: {
                lastRentPaid: { lt: thirtyDaysAgo }
            },
            select: { id: true }
        });

        console.log(`[Property] Found ${overdueProperties.length} overdue properties.`);

        let count = 0;
        for (const property of overdueProperties) {
            try {
                await this.executeForeclosure(property.id);
                count++;
            } catch (error) {
                console.error(`[Property] Failed to foreclose ${property.id}:`, error);
            }
        }
        return count;
    }

    /**
     * Execute a specific property foreclosure.
     * Moves items to recovery stash and frees up the plot.
     * @param {number|any} propertyId - ID of the property to foreclose.
     * @returns {Promise<void>}
     */
    static async executeForeclosure(propertyId) {
        await prisma.$transaction(async (/** @type {any} */ tx) => {
            const property = await tx.propertyInstance.findUnique({
                where: { id: propertyId }
            });

            if (!property) return;

            // 1. Clear property guests
            await tx.propertyGuest.deleteMany({ where: { propertyId } });

            // 2. Free up plot availability
            await tx.regionTemplate.update({
                where: { id: property.regionId },
                data: { plotAvailability: { increment: 1 } }
            });

            // 3. Delete property instance
            await tx.propertyInstance.delete({ where: { id: propertyId } });

            console.log(`[Property] Foreclosed property ${propertyId} in region ${property.regionId}`);
        });
    }
}

module.exports = PropertyForeclosureProcessor;
