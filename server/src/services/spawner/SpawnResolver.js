/**
 * AAA SpawnResolver
 * Logic for merging permanent region spawns with dynamic world event spawns.
 */
class SpawnResolver {
    /**
     * Resolves all available resources in a region, including event-exclusives.
     */
    async resolveResources(prisma, regionId) {
        const now = new Date();
        
        // 1. Get Base Spawns
        const baseSpawns = await prisma.regionResource.findMany({
            where: { regionId },
            include: { item: true }
        });

        // 2. Get Active Events
        const activeEvents = await prisma.activeEvent.findMany({
            where: { regionId, expiresAt: { gt: now } },
            include: { template: { include: { eventResources: { include: { item: true } } } } }
        });

        // 3. Merge Spawns
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
     * Resolves all available monsters in a region, including event-exclusives.
     */
    async resolveMonsters(prisma, regionId) {
        const now = new Date();

        // 1. Get Base Monsters
        const baseMonsters = await prisma.regionMonster.findMany({
            where: { regionId },
            include: { monster: true }
        });

        // 2. Get Active Events
        const activeEvents = await prisma.activeEvent.findMany({
            where: { regionId, expiresAt: { gt: now } },
            include: { template: { include: { eventMonsters: { include: { monster: true } } } } }
        });

        // 3. Merge Monsters
        const results = baseMonsters.map(m => ({
            id: m.id, templateId: m.monsterId, name: m.monster.name, source: "BASE"
        }));

        for (const ae of activeEvents) {
            for (const em of ae.template.eventMonsters) {
                if (Math.random() < em.spawnChance) {
                    results.push({
                        id: `event_${em.id}`, templateId: em.monsterId, name: em.monster.name, 
                        source: `EVENT:${ae.template.name}`
                    });
                }
            }
        }

        return results;
    }
}

module.exports = new SpawnResolver();
