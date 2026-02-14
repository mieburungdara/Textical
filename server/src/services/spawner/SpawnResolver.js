const frontlineSpawner = require('../../logic/npc/FrontlineSpawner');
const worldCycleService = require('../world/WorldCycleService');

/**
 * AAA SpawnResolver
 * Logic for merging permanent region spawns with dynamic world event spawns.
 * Enhanced with Day/Night cycle filtering and caching.
 */
class SpawnResolver {
    constructor() {
        this.cache = new Map(); // Key: `${type}_${regionId}_${hour}`, Value: { results: [], expiresAt: timestamp }
        this.CACHE_TTL_MINUTES = 5;
    }

    /**
     * Gets current world time cycle: DAY or NIGHT
     */
    getCurrentCycle(hour) {
        if (hour === undefined) {
            const state = worldCycleService.getWorldState();
            hour = state.currentHour;
        }
        return (hour < 6 || hour >= 20) ? "NIGHT" : "DAY";
    }

    /**
     * Clears cache if necessary (optional utility)
     */
    clearCache() {
        this.cache.clear();
    }

    _getWithCache(type, regionId, hour) {
        const key = `${type}_${regionId}_${hour}`;
        const cached = this.cache.get(key);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.results;
        }
        return null;
    }

    _setCache(type, regionId, hour, results) {
        const key = `${type}_${regionId}_${hour}`;
        this.cache.set(key, {
            results,
            expiresAt: Date.now() + (this.CACHE_TTL_MINUTES * 60 * 1000)
        });
        
        // Cleanup old cache entries
        if (this.cache.size > 500) {
            const now = Date.now();
            for (const [k, v] of this.cache.entries()) {
                if (v.expiresAt < now) this.cache.delete(k);
            }
        }
    }

    /**
     * Resolves all available resources in a region.
     */
    async resolveResources(prisma, regionId) {
        const worldState = await worldCycleService.getWorldState();
        const hour = worldState.currentHour;
        const currentCycle = this.getCurrentCycle(hour);

        const cached = this._getWithCache('resources', regionId, hour);
        if (cached) return cached;

        const regionData = await prisma.regionTemplate.findUnique({
            where: { id: regionId },
            select: { rareHerbSpawnChance: true, manaStaticIntensity: true }
        });

        const now = new Date();
        
        // Filter based on active_time at database level for base spawns
        const baseSpawns = await prisma.regionResource.findMany({
            where: { 
                regionId,
                OR: [
                    { active_time: null },
                    { active_time: currentCycle },
                    { active_time: 'ANY' }
                ]
            },
            include: { item: true }
        });

        const activeEvents = await prisma.activeEvent.findMany({
            where: { regionId, expiresAt: { gt: now } },
            include: { template: { include: { eventResources: { include: { item: true } } } } }
        });

        const results = baseSpawns.map(s => ({
            id: s.id, templateId: s.itemId, name: s.item.name, 
            gatherTime: s.gatherTimeSeconds, source: "BASE",
            active_time: s.active_time
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

        // 4. AAA: Herb Transmutation (v8.0)
        const intensity = regionData?.manaStaticIntensity ?? 1.0;
        if (intensity > 1.5) {
            for (let r of results) {
                // 15% chance to rank up if intensity is high
                if (r.source === "BASE" && Math.random() < (intensity - 1.5) * 0.2) {
                    const originalName = r.name;
                    r.name = `Resonating ${r.name}`;
                    r.gatherTime *= 1.5;
                    r.isTransmuted = true; // Flag for client/rewards
                }
            }
        }

        this._setCache('resources', regionId, hour, results);
        return results;
    }

    /**
     * Resolves all available monsters in a region.
     */
    async resolveMonsters(prisma, regionId) {
        const worldState = await worldCycleService.getWorldState();
        const hour = worldState.currentHour;
        const currentCycle = this.getCurrentCycle(hour);

        const cached = this._getWithCache('monsters', regionId, hour);
        if (cached) return cached;

        const now = new Date();

        // Filter based on active_time at database level for base monsters
        const baseMonsters = await prisma.regionMonster.findMany({
            where: { 
                regionId,
                monster: {
                    OR: [
                        { active_time: null },
                        { active_time: currentCycle },
                        { active_time: 'ANY' }
                    ]
                }
            },
            include: { monster: true }
        });

        const activeEvents = await prisma.activeEvent.findMany({
            where: { regionId, expiresAt: { gt: now } },
            include: { template: { include: { eventMonsters: { include: { monster: true } } } } }
        });

        const regionData = await prisma.regionTemplate.findUnique({
            where: { id: regionId },
            select: { gridX: true, gridY: true, monsterMigrationStatus: true, manaStaticIntensity: true }
        });

        const results = baseMonsters.map(m => ({
            id: m.id, templateId: m.monsterId, name: m.monster.name, source: "BASE",
            active_time: m.monster.active_time
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

        // 4. AAA: Magical Anomalies (v8.0)
        const intensity = regionData?.manaStaticIntensity ?? 1.0;
        if (intensity > 1.8 && Math.random() < (intensity - 1.7) * 0.3) {
            // Spawn a random elemental or wisp
            const anomalies = [
                { id: "anom_wisp", templateId: 5001, name: "Mana Wisp" },
                { id: "anom_ele", templateId: 5002, name: "Arcane Elemental" }
            ];
            const selected = anomalies[Math.floor(Math.random() * anomalies.length)];
            results.push({
                ...selected,
                source: "MAGICAL_ANOMALY"
            });
        }

        this._setCache('monsters', regionId, hour, results);
        return results;
    }
}

module.exports = new SpawnResolver();