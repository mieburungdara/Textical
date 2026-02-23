const BaseService = require('./BaseService');

/**
 * ReputationService
 * Orchestrates user standing with various world factions.
 */
class ReputationService extends BaseService {
    /**
     * Increases or decreases reputation with a specific faction.
     */
    async addReputation(userId, factionId, amount, tx = null) {
        if (!amount) return;
        const client = tx || this.db;

        return await client.userReputation.upsert({
            where: { userId_factionId: { userId, factionId } },
            update: { amount: { increment: amount } },
            create: { userId, factionId, amount }
        });
    }

    /**
     * Checks if a user meets a specific reputation threshold.
     */
    async checkReputationRequirement(userId, factionId, minAmount) {
        if (!factionId || minAmount <= 0) return true;

        const rep = await this.db.userReputation.findUnique({
            where: { userId_factionId: { userId, factionId } }
        });

        return (rep ? rep.amount : 0) >= minAmount;
    }

    /**
     * Gets all reputation standing for a user.
     */
    async getUserReputation(userId) {
        return await this.db.userReputation.findMany({
            where: { userId },
            include: { faction: true }
        });
    }
}

module.exports = new ReputationService();