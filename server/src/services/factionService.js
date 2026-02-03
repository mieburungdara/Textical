const BaseService = require('./BaseService');

/**
 * FactionService
 * Orchestrates player membership and progression within world factions.
 * Enhanced with stat system integration.
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

        const perks = [];
        
        // Add stat-based perks
        if (rank.statKey && rank.statValue) {
            perks.push({
                key: rank.statKey,
                value: rank.statValue,
                type: 'stat',
                source: `FactionRank:${rank.name}`
            });
        }
        
        // Add secondary stat perks if they exist
        if (rank.statKey2 && rank.statValue2) {
            perks.push({
                key: rank.statKey2,
                value: rank.statValue2,
                type: 'stat',
                source: `FactionRank:${rank.name}`
            });
        }
        
        return perks;
    }

    /**
     * Get detailed faction information including stat bonuses.
     */
    async getFactionDetails(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { faction: true }
        });

        if (!user || !user.faction) return null;

        const currentRank = await this.calculateCurrentRank(userId);
        const activePerks = await this.getActivePerks(userId);

        return {
            faction: user.faction,
            currentRank: currentRank,
            activePerks: activePerks,
            statBonuses: activePerks.filter(p => p.type === 'stat')
        };
    }

    /**
     * Get stat modifiers from faction perks for EnhancedStat system.
     */
    async getStatModifiers(userId) {
        const perks = await this.getActivePerks(userId);
        
        return perks
            .filter(p => p.type === 'stat')
            .map(p => ({
                statKey: p.key,
                value: p.value,
                source: p.source,
                isPercent: p.value < 1.0 && p.value > 0
            }));
    }
}

module.exports = new FactionService();
