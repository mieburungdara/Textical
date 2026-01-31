const BaseService = require('../BaseService');

/**
 * NPCBehaviorService
 * Orchestrates dynamic NPC presence and reactions.
 * Decouples static NPC templates from phenomenal/schedule-based state.
 */
class NPCBehaviorService extends BaseService {
    /**
     * Resolves the current status of an NPC.
     * Logic Priority: Event Reaction > Schedule > Base Region.
     */
    async resolveNPCPresence(npcId, currentHour) {
        const npc = await this.db.nPCTemplate.findUnique({
            where: { id: npcId },
            include: { 
                schedules: true, 
                eventReactions: { include: { eventTemplate: { include: { activeEvents: true } } } },
                regions: true 
            }
        });

        if (!npc) return null;

        // 1. Check Event Reactions (Highest Priority)
        for (const reaction of npc.eventReactions) {
            // If the reaction's template has ANY active events, apply the reaction
            if (reaction.eventTemplate.activeEvents.length > 0) {
                return {
                    regionId: reaction.targetRegionId || npc.regions[0]?.regionId,
                    overrideDialogueId: reaction.overrideDialogueId,
                    status: "EVENT_REACTION",
                    eventName: reaction.eventTemplate.name
                };
            }
        }

        // 2. Check Schedules
        const schedule = npc.schedules.find(s => 
            (s.hourStart <= currentHour && s.hourEnd >= currentHour) || 
            (s.hourStart > s.hourEnd && (currentHour >= s.hourStart || currentHour <= s.hourEnd)) // Overnight support
        );

        if (schedule) {
            return {
                regionId: schedule.targetRegionId,
                status: "SCHEDULED"
            };
        }

        // 3. Fallback to Base Region
        return {
            regionId: npc.regions[0]?.regionId,
            status: "NORMAL"
        };
    }

    /**
     * Finds all NPCs currently present in a region.
     */
    async getNPCsInRegion(regionId, currentHour) {
        const allNpcs = await this.db.nPCTemplate.findMany({
            include: { schedules: true, eventReactions: { include: { eventTemplate: { include: { activeEvents: true } } } }, regions: true }
        });

        const present = [];
        for (const npc of allNpcs) {
            const presence = await this.resolveNPCPresence(npc.id, currentHour);
            if (presence && presence.regionId === regionId) {
                present.push({ ...npc, currentPresence: presence });
            }
        }
        return present;
    }
}

module.exports = new NPCBehaviorService();
