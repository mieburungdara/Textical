const frontlineSpawner = require('../../logic/npc/FrontlineSpawner');

/**
 * AAA SpawnResolver
 * Logic for merging permanent region spawns with dynamic world event spawns.
 * Enhanced with Frontline Skirmish support.
 */
class SpawnResolver {
    /**
     * Resolves all available resources in a region.
     */
    async resolveResources(prisma, regionId) {
        const now = new Date();
        
        const baseSpawns = await prisma.regionResource.findMany({
            where: { regionId },
            include: { item: true }
        });

        const activeEvents = await prisma.activeEvent.findMany({
            where: { regionId, expiresAt: { gt: now } },
            include: { template: { include: { eventResources: { include: { item: true } } } } }
        });

        const results = baseSpawns.map(s => ({
            id: s.id, templateId: s.itemId, name: s.item.name, 
            gatherTime: s.gatherTimeSeconds, source: "BASE"
        }));

        for (const ae of activeEvents) {
            for (const er of ae.template.eventResources) {
                if (Math.random() < er.spawnChance) {
                    results.push({
                        id: `event_${er.id}`, templateId: er.itemId, name: er.item.name,
                        gatherTime: er.gatherTime, source: `EVENT:${ae.template.name}`
                    });
                }
            }
        }

        return results;
    }

    /**
     * Resolves all available monsters in a region, including event-exclusives and reinforcements.
     */
    async resolveMonsters(prisma, regionId) {
        const now = new Date();

        const baseMonsters = await prisma.regionMonster.findMany({
            where: { regionId },
            include: { monster: true }
        });

        const activeEvents = await prisma.activeEvent.findMany({
            where: { regionId, expiresAt: { gt: now } },
            include: { template: { include: { eventMonsters: { include: { monster: true } } } } }
        });

        const results = baseMonsters.map(m => ({
            id: m.id, templateId: m.monsterId, name: m.monster.name, source: "BASE"
        }));

        for (const ae of activeEvents) {
            // 1. Standard Event Spawns
            for (const em of ae.template.eventMonsters) {
                if (Math.random() < em.spawnChance) {
                    results.push({
                        id: `event_${em.id}`, templateId: em.monsterId, name: em.monster.name, 
                        source: `EVENT:${ae.template.name}`
                    });
                }
            }

            // 2. AAA Frontline Skirmish Logic
            if (ae.template.name.includes("Frontline")) {
                const influenceData = await prisma.regionalInfluence.findMany({
                    where: { regionId },
                    orderBy: { points: 'desc' },
                    take: 2
                });

                if (influenceData.length >= 2) {
                    const skirmishers = await frontlineSpawner.resolveFrontlineUnits(
                        prisma, regionId, influenceData[0].factionId, influenceData[1].factionId
                    );
                    results.push(...skirmishers);
                }
            }
        }

        return results;
    }
}

module.exports = new SpawnResolver();