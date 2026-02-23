const BaseService = require('../BaseService');
const worldCycle = require('../world/WorldCycleService');

class BattleContextService extends BaseService {
    /**
     * Get environment context for battle simulation.
     * @param {number} regionId - Region ID.
     * @returns {Promise<Object>} Environment context.
     */
    async getEnvironmentContext(regionId) {
        const regionTemplate = await this.db.regionTemplate.findUnique({
            where: { id: regionId },
            include: { regionType: { include: { effects: true } } }
        });

        const worldState = await worldCycle.getWorldState();
        const fogIntensity = regionTemplate?.mysticFogIntensity || 0;
        
        return {
            regionType: regionTemplate ? regionTemplate.visualType : "FOREST",
            terrainEffects: regionTemplate && regionTemplate.regionType ? regionTemplate.regionType.effects : [],
            currentHour: worldState.currentHour,
            weather: worldState.weatherType,
            moonPhase: worldState.moonPhase,
            mysticFogIntensity: fogIntensity,
            manaStaticIntensity: regionTemplate?.manaStaticIntensity ?? 1.0,
            accMod: 1.0 - Math.min(fogIntensity, 0.9)
        };
    }

    /**
     * Get user context for battle.
     * @param {number} userId - User ID.
     * @returns {Promise<Object>} User context including formation.
     */
    async getUserContext(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { 
                formationPresets: { include: { slots: true } },
                taskQueue: { where: { status: "RUNNING" } }
            }
        });

        if (!user) throw new Error("User not found");

        return user;
    }
}

module.exports = new BattleContextService();
