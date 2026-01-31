const BaseService = require('./BaseService');

/**
 * TerritoryConquestService
 * Orchestrates regional ownership and siege outcomes.
 */
class TerritoryConquestService extends BaseService {
    /**
     * Assigns a region to a guild.
     * Overwrites any existing ownership (Siege Success).
     */
    async captureTerritory(tx, guildId, regionId) {
        const region = await tx.regionTemplate.findUnique({
            where: { id: regionId }
        });

        if (!region) throw new Error("Region not found.");

        // Upsert ownership
        return await tx.territory.upsert({
            where: { regionId },
            update: { guildId, capturedAt: new Date(), lastUpkeepAt: new Date() },
            create: { regionId, guildId }
        });
    }

    /**
     * Removes guild control from a region.
     */
    async relinquishTerritory(tx, regionId) {
        return await tx.territory.deleteMany({
            where: { regionId }
        });
    }

    /**
     * Helper to get the owning guild of a region.
     */
    async getOwningGuild(regionId) {
        const territory = await this.db.territory.findUnique({
            where: { regionId },
            include: { guild: true }
        });
        return territory ? territory.guild : null;
    }
}

module.exports = new TerritoryConquestService();
