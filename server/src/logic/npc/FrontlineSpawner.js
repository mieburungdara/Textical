/**
 * AAA FrontlineSpawner
 * Pure logic for resolving faction-specific skirmishers and military units.
 */
class FrontlineSpawner {
    constructor() {
        this.SOLDIER_TEMPLATE_ID = 500; // Placeholder for Frontline Soldier
        this.COMMANDER_TEMPLATE_ID = 501; // Placeholder for Frontline Commander
    }

    /**
     * Resolves automated military units for a conflict region.
     * Returns a list of monster objects to be injected into the regional spawner.
     */
    async resolveFrontlineUnits(tx, regionId, factionAId, factionBId) {
        if (!factionAId || !factionBId) return [];

        const factionA = await tx.faction.findUnique({ where: { id: factionAId } });
        const factionB = await tx.faction.findUnique({ where: { id: factionBId } });

        if (!factionA || !factionB) return [];

        // Generate 2 soldiers for each faction battling in the region
        return [
            {
                instanceId: `frontline_${regionId}_A1`,
                templateId: this.SOLDIER_TEMPLATE_ID,
                name: `${factionA.name} Vanguard`,
                factionId: factionAId,
                status: "SKIRMISHING",
                hp_base: 500, damage_base: 40
            },
            {
                instanceId: `frontline_${regionId}_B1`,
                templateId: this.SOLDIER_TEMPLATE_ID,
                name: `${factionB.name} Legionnaire`,
                factionId: factionBId,
                status: "SKIRMISHING",
                hp_base: 500, damage_base: 40
            }
        ];
    }
}

module.exports = new FrontlineSpawner();
