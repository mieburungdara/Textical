const banditService = require('../../services/BanditService');
const spiritService = require('../../services/SpiritService');

/**
 * TravelIncidentResolver
 * Separates navigation logic from random world encounters (Bandits, Spirits).
 */
class TravelIncidentResolver {
    /**
     * Checks and resolves potential incidents during travel.
     * @param {number} userId - ID of the traveling user.
     * @param {any} connection - Prisma regionConnection with target region info.
     * @param {any} userData - Current user data including silver and escort status.
     * @returns {Promise<Object|null>} Incident result or null if none occurred.
     */
    static async resolveIncidents(userId, connection, userData) {
        // 1. Bandit Ambush Check
        const ambushChance = await banditService.calculateAmbushChance(userId, connection.targetRegionId);
        const isAmbushed = Math.random() < ambushChance;

        if (isAmbushed && userData.escortGridsRemaining <= 0) {
            const ambientSign = banditService.getAmbientSigns(connection.target.banditThreatLevel);
            return {
                type: "AMBUSH",
                message: ambientSign || "Kamu dihentikan oleh sekelompok bandit di tengah jalan!",
                ransomCost: Math.floor(userData.silver * 0.3),
                regionId: connection.targetRegionId
            };
        }

        // 2. Spirit Encounter Check (Nocturnal/Special)
        const spiritEncounter = await spiritService.checkSpiritEncounter(userId, connection.targetRegionId);
        if (spiritEncounter) {
            const spiritData = await spiritService.applySpiritEffect(userId, spiritEncounter);
            return {
                type: "SPIRIT",
                data: spiritData
            };
        }

        return null;
    }

    /**
     * Get ambient signs for the target region
     * @param {number|any} threatLevel - Bandit threat level of the region.
     * @returns {string} Ambient sign message.
     */
    static getAmbientSigns(threatLevel) {
        return banditService.getAmbientSigns(threatLevel);
    }
}

module.exports = TravelIncidentResolver;
