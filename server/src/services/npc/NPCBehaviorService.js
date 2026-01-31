const BaseService = require('../BaseService');

/**
 * NPCBehaviorService
 * Orchestrates dynamic NPC presence and reactions.
 */
class NPCBehaviorService extends BaseService {
    /**
     * Resolves the current status of an NPC.
     * Priority: Event Reaction > Schedule > Base Region.
     */
    async resolveNPCPresence(npcId, hour = null) {
        const currentHour = (hour !== null) ? hour : new Date().getHours();

        const npc = await this.db.nPCTemplate.findUnique({
            where: { id: npcId },
            include: { 
                schedules: true, 
                eventReactions: { include: { eventTemplate: { include: { activeEvents: true } } } },
                regions: true 
            }
        });

        if (!npc) return null;

        // 1. Check Event Reactions
        for (const reaction of npc.eventReactions) {
            if (reaction.eventTemplate.activeEvents.length > 0) {
                return {
                    regionId: reaction.targetRegionId || (npc.regions[0] ? npc.regions[0].regionId : null),
                    overrideDialogueId: reaction.overrideDialogueId,
                    status: "EVENT_REACTION",
                    eventName: reaction.eventTemplate.name
                };
            }
        }

        // 2. Check Schedules
        const schedule = npc.schedules.find(s => 
            (s.hourStart <= currentHour && s.hourEnd >= currentHour) || 
            (s.hourStart > s.hourEnd && (currentHour >= s.hourStart || currentHour <= s.hourEnd))
        );

        if (schedule) {
            return {
                regionId: schedule.targetRegionId,
                status: "SCHEDULED"
            };
        }

        // 3. Fallback to Primary Base Region
        return {
            regionId: npc.regions[0] ? npc.regions[0].regionId : null,
            status: "NORMAL",
            allMappedRegions: npc.regions.map(r => r.regionId)
        };
    }

    /**
     * Finds all NPCs currently present in a region.
     */
    async getNPCsInRegion(regionId, hour = null) {
        const currentHour = (hour !== null) ? hour : new Date().getHours();

        const allPotentialNPCs = await this.db.nPCTemplate.findMany({
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
            const presence = await this.resolveNPCPresence(npc.id, currentHour);
            
            if (!presence) continue;

            // Check if NPC is in this region via any valid logic
            const isResolvedHere = presence.regionId === regionId;
            const isAtMappedBase = presence.status === "NORMAL" && npc.regions.some(r => r.regionId === regionId);

            if (isResolvedHere || isAtMappedBase) {
                present.push({ ...npc, currentPresence: presence });
            }
        }
        return present;
    }
}

module.exports = new NPCBehaviorService();