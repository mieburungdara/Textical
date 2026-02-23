/**
 * AAA ReinforcementSpawner
 * Logic for spawning automated faction defenses during siege states.
 */
class ReinforcementSpawner {
    constructor() {
        this.ELITE_GUARD_TEMPLATE_ID = 100; // Placeholder for Elite Guard
    }

    /**
     * Resolves automated reinforcements for a region.
     * Returns a list of NPC objects to be injected into the regional discovery.
     */
    async resolveReinforcements(tx, regionId, dominantFactionId, isSiege) {
        if (!isSiege || !dominantFactionId) return [];

        const faction = await tx.faction.findUnique({ where: { id: dominantFactionId } });
        if (!faction) return [];

        // In a real system, we might have multiple Guard templates per faction
        return [
            {
                instanceId: `reinforce_${regionId}_1`,
                templateId: this.ELITE_GUARD_TEMPLATE_ID,
                name: `${faction.name} Veteran Guard`,
                title: "Reinforcement",
                type: "GUARD",
                factionId: dominantFactionId,
                description: `I am here to protect our interests in ${faction.name} territory!`,
                currentPresence: { status: "REINFORCEMENT" }
            }
        ];
    }
}

module.exports = new ReinforcementSpawner();
