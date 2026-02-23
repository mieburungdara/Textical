const BaseService = require('../BaseService');
const influenceResolver = require('../../logic/faction/InfluenceResolver');
const reinforcementSpawner = require('../../logic/npc/ReinforcementSpawner');

// Simple in-memory cache
const cache = {
    data: new Map(),
    get(key) {
        const item = this.data.get(key);
        if (item && item.expires > Date.now()) return item.value;
        return null;
    },
    set(key, value, ttlSeconds) {
        this.data.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
    }
};

/**
 * NPCBehaviorService
 * Orchestrates dynamic NPC presence, reactions, and reinforcements.
 */
class NPCBehaviorService extends BaseService {
    /**
     * Resolves the current status of an NPC.
     * Priority: Event Reaction > Schedule > Wandering > Base Region.
     * @param {number|object} npcOrId - NPC ID or full NPC object (for batching)
     * @param {number} [hour] - Current hour (optional, defaults to checked worldState)
     */
    async resolveNPCPresence(npcOrId, hour = null) {
        try {
            const currentHour = (hour !== null) ? hour : new Date().getHours(); 
            // Note: Ideally pass hour from worldState in caller to enforce consistency.
            
            let npc = npcOrId;
            // 1. Fetch NPC if only ID provided (Legacy Support / N+1 Risk)
            if (typeof npcOrId === 'number') {
                npc = await this.db.nPCTemplate.findUnique({
                    where: { id: npcOrId },
                    include: { 
                        schedules: true, 
                        eventReactions: { include: { eventTemplate: { include: { activeEvents: true } } } },
                        regions: true 
                    }
                });
            }

            if (!npc) return null;

            // Edge Case: No Regions matched
            if (!npc.regions || npc.regions.length === 0) {
                // Log warning but don't crash
                // console.warn(`NPC ${npc.id} (${npc.name}) has no mapped regions.`);
                return null;
            }

            // 2. Check Event Reactions (Priority: ID specific sorting or first found)
            if (npc.eventReactions && npc.eventReactions.length > 0) {
                // Sort by ID desc to prioritize newer events if multiple active
                const sortedReactions = [...npc.eventReactions].sort((a, b) => b.id - a.id);
                
                for (const reaction of sortedReactions) {
                    if (reaction.eventTemplate.activeEvents && reaction.eventTemplate.activeEvents.length > 0) {
                        return {
                            regionId: reaction.targetRegionId || (npc.regions[0] ? npc.regions[0].regionId : null),
                            overrideDialogueId: reaction.overrideDialogueId,
                            status: "EVENT_REACTION",
                            eventName: reaction.eventTemplate.name
                        };
                    }
                }
            }

            // 3. Check Schedules
            if (npc.schedules && npc.schedules.length > 0) {
                // Edge Case: Schedule Overlap - Prioritize shortest duration
                const sortedSchedules = [...npc.schedules].sort((a, b) => {
                    const durationA = (a.hourEnd >= a.hourStart) ? (a.hourEnd - a.hourStart) : (24 - a.hourStart + a.hourEnd);
                    const durationB = (b.hourEnd >= b.hourStart) ? (b.hourEnd - b.hourStart) : (24 - b.hourStart + b.hourEnd);
                    return durationA - durationB;
                });

                const schedule = sortedSchedules.find(s => 
                    (s.hourStart <= currentHour && s.hourEnd >= currentHour) || 
                    (s.hourStart > s.hourEnd && (currentHour >= s.hourStart || currentHour <= s.hourEnd))
                );

                if (schedule) {
                    return {
                        regionId: schedule.targetRegionId,
                        status: "SCHEDULED"
                    };
                }
            }

            // 4. Check Wandering Logic
            if (npc.isWanderer && npc.regions.length > 0) {
                const now = new Date();
                // Move every 5 minutes (12 intervals per hour)
                const intervalIndex = Math.floor(now.getMinutes() / 5);
                // Use npc.id to offset so not all wanderers move at the exact same interval (jitter)
                const regionIndex = (intervalIndex + npc.id) % npc.regions.length;
                
                return {
                    regionId: npc.regions[regionIndex].regionId,
                    status: "WANDERING"
                };
            }

            // 5. Fallback to Primary Base Region
            return {
                regionId: npc.regions[0].regionId,
                status: "NORMAL",
                allMappedRegions: npc.regions.map(r => r.regionId)
            };

        } catch (error) {
            console.error(`[NPCBehaviorService] Error resolving presence for NPC ${typeof npcOrId === 'number' ? npcOrId : npcOrId?.id}:`, error);
            return null;
        }
    }

    /**
     * Finds all NPCs currently present in a region, including reinforcements.
     * Uses strict worldState time, caching, and data sanitization.
     */
    async getNPCsInRegion(regionId, hour = null) {
        try {
            // Caching Key
            const cacheKey = `npcs_region_${regionId}_${hour || 'current'}`;
            const cached = cache.get(cacheKey);
            if (cached) return cached;

            let currentHour = hour;
            if (currentHour === null) {
                const worldState = await this.db.worldState.findUnique({ where: { id: 1 } });
                if (!worldState) throw new Error("WorldState not found.");
                currentHour = worldState.currentHour;
            }

            const isNight = currentHour < 6 || currentHour >= 20;
            const currentCycle = isNight ? "NIGHT" : "DAY";

            // Eager Load ALL potential NPCs to avoid N+1 inside loop
            const allPotentialNPCs = await this.db.nPCTemplate.findMany({
                where: {
                    OR: [
                        { active_time: null },
                        { active_time: currentCycle },
                        { active_time: 'ANY' }
                    ]
                },
                include: { 
                    schedules: true, 
                    eventReactions: { include: { eventTemplate: { include: { activeEvents: true } } } }, 
                    regions: true,
                    shopItems: true,
                    teleportRoutes: true
                }
            });

            const present = [];
            for (const npc of allPotentialNPCs) {
                // Pass FULL OBJECT to avoid DB re-fetch
                const presence = await this.resolveNPCPresence(npc, currentHour);
                if (!presence) continue;

                const isResolvedHere = presence.regionId === regionId;
                const isAtMappedBase = presence.status === "NORMAL" && npc.regions.some(r => r.regionId === regionId);

                if (isResolvedHere || isAtMappedBase) {
                    // Security: Sanitize logic (only expose public fields)
                    const sanitizedNPC = {
                        id: npc.id,
                        name: npc.name,
                        title: npc.title,
                        type: npc.type,
                        factionId: npc.factionId,
                        modelScale: npc.modelScale,
                        // Exclude internal logic flags/server-side only data if necessary
                        // Include specific presence data
                        currentPresence: presence
                    };
                    present.push(sanitizedNPC);
                }
            }

            // --- Reinforcement Logic (Keep as is, assumes optimized internally or separate concern) ---
            const influenceData = await this.db.regionalInfluence.findMany({
                where: { regionId },
                orderBy: { points: 'desc' },
                take: 1 // Optimization: Take only top 1
            });

            const topInfluence = influenceData[0] ? influenceData[0].points : 0;
            const dominantFactionId = influenceData[0] ? influenceData[0].factionId : null;

            if (dominantFactionId) {
                const activeWarEvents = await this.db.activeEvent.count({
                    where: { regionId, template: { name: { contains: "War" } } }
                });
                const isSiege = influenceResolver.isSiegeState(topInfluence, activeWarEvents > 0);

                if (isSiege) {
                    const reinforcements = await reinforcementSpawner.resolveReinforcements(this.db, regionId, dominantFactionId, isSiege);
                    present.push(...reinforcements);
                }
            }

            // Set Cache (TTL 30s)
            cache.set(cacheKey, present, 30);

            return present;

        } catch (error) {
            console.error(`[NPCBehaviorService] Error getting NPCs in region ${regionId}:`, error);
            return []; // Fail gracefully with empty list
        }
    }
}

module.exports = new NPCBehaviorService();
