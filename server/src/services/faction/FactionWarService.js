const BaseService = require('../BaseService');

/**
 * FactionWarService
 * Orchestrates global relations and war status between world factions.
 */
class FactionWarService extends BaseService {
    /**
     * Resolves the current relation between two factions.
     * Status is symmetrical (A->B is same as B->A).
     */
    async getRelation(factionAId, factionBId) {
        if (!factionAId || !factionBId) return "NEUTRAL";
        if (factionAId === factionBId) return "ALLY";

        const first = Math.min(factionAId, factionBId);
        const second = Math.max(factionAId, factionBId);

        const relation = await this.db.factionRelation.findUnique({
            where: { factionAId_factionBId: { factionAId: first, factionBId: second } }
        });

        return relation ? relation.status : "NEUTRAL";
    }

    /**
     * Updates the status between two factions.
     */
    async setRelation(factionAId, factionBId, status) {
        const first = Math.min(factionAId, factionBId);
        const second = Math.max(factionAId, factionBId);

        return await this.db.factionRelation.upsert({
            where: { factionAId_factionBId: { factionAId: first, factionBId: second } },
            update: { status },
            create: { factionAId: first, factionBId: second, status }
        });
    }

    /**
     * Checks if a player's faction is at war with an NPC's faction.
     */
    async isAtWar(userFactionId, targetFactionId) {
        const status = await this.getRelation(userFactionId, targetFactionId);
        return status === "WAR";
    }
}

module.exports = new FactionWarService();
