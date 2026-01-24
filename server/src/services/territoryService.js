const prisma = new (require('@prisma/client').PrismaClient)();

class TerritoryService {
    /**
     * Allows a Guild Master to set the regional tax rate.
     */
    async setRegionalTax(userId, regionId, newRate) {
        if (newRate < 0 || newRate > 0.1) throw new Error("Tax rate must be between 0% and 10%.");

        const region = await prisma.regionTemplate.findUnique({ where: { id: regionId } });
        if (!region) throw new Error("Region not found.");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user.guildId || user.guildId !== region.ownerGuildId || user.guildRole !== "MASTER") {
            throw new Error("Only the Guild Master of the owning guild can set tax rates.");
        }

        return await prisma.regionTemplate.update({
            where: { id: regionId },
            data: { localTaxRate: newRate }
        });
    }

    /**
     * Schedules a Siege event for a region.
     */
    async scheduleSiege(attackerGuildId, regionId, startTime) {
        const region = await prisma.regionTemplate.findUnique({ where: { id: regionId } });
        
        return await prisma.siege.create({
            data: {
                regionId,
                attackerGuildId,
                defenderGuildId: region.ownerGuildId,
                startTime,
                endTime: new Date(startTime.getTime() + (60 * 60 * 1000)), // 1 hour duration
                status: "PENDING"
            }
        });
    }
}

module.exports = new TerritoryService();
