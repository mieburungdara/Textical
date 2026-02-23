const BaseService = require('./BaseService');

/**
 * EcosystemService
 * Manages ecologicalStress and its effects on gameplay.
 */
class EcosystemService extends BaseService {
    constructor() {
        super();
        this.MAX_STRESS = 1.0;
        this.STRESS_INCREMENT_PER_KILL = 0.005; // 200 kills to reach max stress
        this.STRESS_DECAY_PER_HOUR = 0.05;
    }

    /**
     * Increase stress in a region due to harvest or kill
     */
    async reportActivity(regionId, amount = this.STRESS_INCREMENT_PER_KILL) {
        const region = await this.db.regionTemplate.findUnique({
            where: { id: regionId },
            select: { ecologicalStress: true }
        });

        if (!region) return;

        const newStress = Math.min(this.MAX_STRESS, region.ecologicalStress + amount);
        
        return await this.db.regionTemplate.update({
            where: { id: regionId },
            data: { ecologicalStress: newStress }
        });
    }

    /**
     * Get modifiers based on current stress
     * High Stress -> Lower Spawn Rate, Higher Drop Quality (rare survivors)
     */
    getModifiers(stress) {
        return {
            spawnRateMult: Math.max(0.2, 1.0 - (stress * 0.8)), // Drops to 20% at max stress
            dropRateMult: 1.0 + (stress * 0.5) // Increases to 150% at max stress
        };
    }

    /**
     * Global ticker to decay stress in all regions (e.g., called every hour)
     */
    async decayAllRegions() {
        return await this.db.regionTemplate.updateMany({
            where: { ecologicalStress: { gt: 0 } },
            data: { ecologicalStress: { decrement: this.STRESS_DECAY_PER_HOUR } }
        });
    }
}

module.exports = new EcosystemService();
