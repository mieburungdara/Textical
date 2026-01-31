const BaseService = require('./BaseService');

/**
 * FactionService
 * Orchestrates player membership and progression within world factions.
 */
class FactionService extends BaseService {
    /**
     * Joins a user to a specific faction.
     */
    async joinFaction(userId, factionId) {
        const user = await this.db.user.findUnique({ where: { id: userId } });
        if (user.factionId) throw new Error("Already a member of a faction.");

        return await this.db.user.update({
            where: { id: userId },
            data: { factionId }
        });
    }

    /**
     * Resolves the user's current rank in their faction.
     */
    async calculateCurrentRank(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { faction: { include: { ranks: { orderBy: { minReputation: 'desc' } } } } }
        });

        if (!user || !user.faction) return null;

        const reputation = await this.db.userReputation.findUnique({
            where: { userId_factionId: { userId, factionId: user.factionId } }
        });

        const currentRep = reputation ? reputation.amount : 0;

        // Find the highest rank the user qualifies for
        const rank = user.faction.ranks.find(r => currentRep >= r.minReputation);
        return rank || null;
    }

    /**
     * Gets all cumulative perks for the user's rank.
     */
    async getActivePerks(userId) {
        const rank = await this.calculateCurrentRank(userId);
        if (!rank) return [];

        // In this system, only the current rank's perks apply (not cumulative from previous ranks)
        const perks = [];
        if (rank.statKey && rank.statValue) {
            perks.push({ key: rank.statKey, value: rank.statValue });
        }
        return perks;
    }
}

module.exports = new FactionService();
