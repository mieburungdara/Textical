const BaseService = require('../BaseService');

/**
 * WarPointService
 * Thin orchestrator for regional faction influence (War Points).
 */
class WarPointService extends BaseService {
    /**
     * Adds influence points to a faction in a specific region.
     */
    async addInfluence(userId, regionId, amount) {
        if (!amount) return;

        const user = await this.db.user.findUnique({ where: { id: userId } });
        if (!user || !user.factionId) return;

        return await this.db.regionalInfluence.upsert({
            where: { factionId_regionId: { factionId: user.factionId, regionId } },
            update: { points: { increment: amount }, lastUpdated: new Date() },
            create: { factionId: user.factionId, regionId, points: amount }
        });
    }

    /**
     * Identifies the faction with the highest influence in a region.
     */
    async getDominantFaction(regionId) {
        const top = await this.db.regionalInfluence.findFirst({
            where: { regionId },
            orderBy: { points: 'desc' },
            include: { faction: true }
        });

        return top ? top.faction : null;
    }

    /**
     * Gets all faction influence levels for a region.
     */
    async getRegionInfluence(regionId) {
        return await this.db.regionalInfluence.findMany({
            where: { regionId },
            include: { faction: true },
            orderBy: { points: 'desc' }
        });
    }
}

module.exports = new WarPointService();
