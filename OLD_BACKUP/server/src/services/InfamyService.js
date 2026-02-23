const BaseService = require('./BaseService');

/**
 * InfamyService
 * Manages player criminal status and Inn access restrictions.
 */
class InfamyService extends BaseService {
    constructor() {
        super();
        this.INFAMY_THRESHOLD = 50; // Points at which you are rejected from legitimate Inns
    }

    /**
     * Record a PK event to increase infamy
     */
    async addInfamy(userId, amount = 10) {
        return await this.db.user.update({
            where: { id: userId },
            data: { infamyScore: { increment: amount } }
        });
    }

    /**
     * Check if a player can enter the Inn in a specific region
     */
    async canEnterInn(userId, regionId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            select: { infamyScore: true }
        });

        const region = await this.db.regionTemplate.findUnique({
            where: { id: regionId },
            select: { isBanditHideout: true, zoneType: true }
        });

        if (!region) throw new Error("Region not found.");

        // High Infamy players can only enter Bandit Hideouts
        if (user.infamyScore >= this.INFAMY_THRESHOLD) {
            if (!region.isBanditHideout) {
                return {
                    allowed: false,
                    reason: "The guards recognize your face. You are not welcome in this legitimate establishment. Seek a Bandit Hideout instead."
                };
            }
        }

        // Potential logic: Low Infamy players might be wary of Bandit Hideouts? 
        // For now, let's allow everyone to Bandit Hideouts (neutral ground for criminals).

        return { allowed: true };
    }

    /**
     * Reduce infamy over time or through specific acts
     */
    async decayInfamy(userId, amount = 1) {
        const user = await this.db.user.findUnique({ where: { id: userId } });
        const newScore = Math.max(0, user.infamyScore - amount);
        
        return await this.db.user.update({
            where: { id: userId },
            data: { infamyScore: newScore }
        });
    }
}

module.exports = new InfamyService();
