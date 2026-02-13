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
     * Calculates tax distribution rate based on faction alignment.
     * Returns: Guild's share (0.0 to 1.0, Royal gets the remainder).
     */
    calculateTaxDistribution(guild, region) {
        let guildShare = 0.5; // Base: 50% Guild, 50% Royal

        // AAA: Vassal Loyalty Bonus
        if (guild.factionId && region.factionId && guild.factionId === region.factionId) {
            guildShare += 0.2; // +20% for faction alignment
            console.log(`[TAX] Faction Match Bonus: Guild ${guild.name} shares same faction as Region ${region.name}`);
        }

        // Cap at 0.0 to 1.0
        return Math.max(0.0, Math.min(1.0, guildShare));
    }

    /**
     * Assigns a region to a guild.
     */
    async captureTerritory(tx, guildId, regionId) {
        console.log(`[CONQUEST] Capturing Region ${regionId} for Guild ${guildId}`);
        
        const region = await tx.regionTemplate.findUnique({
            where: { id: regionId }
        });

        if (!region) throw new Error("Region not found.");

        // 1. Sync Denormalized ID to Region
        await tx.regionTemplate.update({
            where: { id: regionId },
            data: { guildOwnershipId: guildId }
        });

        // 2. Prepare Maintenance Dates
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);

        // 3. Calculate Tax Distribution Rate
        const guild = await tx.guild.findUnique({ where: { id: guildId } });
        const taxRate = this.calculateTaxDistribution(guild, region);
        console.log(`[TAX] Distribution Rate for Region ${region.name}: ${(taxRate * 100).toFixed(0)}% Guild / ${((1 - taxRate) * 100).toFixed(0)}% Royal`);

        // 4. Upsert Territory Record
        return await tx.territory.upsert({
            where: { regionId },
            update: { 
                guildId, 
                capturedAt: new Date(), 
                lastUpkeepAt: new Date(),
                nextMaintenanceAt: nextDate,
                monthlyQuestProgress: 0,
                taxDistributionRate: taxRate,
                siegeStatus: "PEACE"
            },
            create: { 
                regionId, 
                guildId,
                maintenanceCost: 1000, 
                monthlyQuestQuota: 5,
                taxDistributionRate: taxRate,
                nextMaintenanceAt: nextDate,
                fortification: 1000,
                maxFortification: 1000,
                siegeStatus: "PEACE"
            }
        });
    }

    /**
     * Removes guild control from a region.
     */
    async relinquishTerritory(tx, regionId) {
        // AAA: Denormalization sync (Clear ownership)
        await tx.regionTemplate.update({
            where: { id: regionId },
            data: { guildOwnershipId: null }
        });

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