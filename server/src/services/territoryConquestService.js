const BaseService = require('./BaseService');

/**
 * TerritoryConquestService
 * Orchestrates regional ownership and siege outcomes.
 * Enhanced with Faction-based siege support bonuses.
 */
class TerritoryConquestService extends BaseService {
    constructor() {
        super();
        this.BASE_SIEGE_VITALITY_COST = 50;
        this.FACTION_SIEGE_BONUS_MULT = 0.80; // 20% Discount
    }

    /**
     * Calculates the cost to siege a specific region.
     */
    async calculateSiegeCosts(guildId, regionId) {
        const guild = await this.db.guild.findUnique({ where: { id: guildId } });
        const region = await this.db.regionTemplate.findUnique({ where: { id: regionId } });

        let cost = this.BASE_SIEGE_VITALITY_COST;

        // AAA: Faction Siege Support - If guild faction matches region faction
        if (guild.factionId && region.factionId && guild.factionId === region.factionId) {
            cost = Math.floor(cost * this.FACTION_SIEGE_BONUS_MULT);
        }

        return { vitality: cost };
    }

    /**
     * Assigns a region to a guild.
     */
    async captureTerritory(tx, guildId, regionId) {
        const region = await tx.regionTemplate.findUnique({
            where: { id: regionId }
        });

        if (!region) throw new Error("Region not found.");

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

    async getOwningGuild(regionId) {
        const territory = await this.db.territory.findUnique({
            where: { regionId },
            include: { guild: true }
        });
        return territory ? territory.guild : null;
    }
}

module.exports = new TerritoryConquestService();