/**
 * AAA NPCActionResolver
 * Pure logic for determining NPC dialogue and interaction overrides.
 * Enhanced with Faction alignment reactivity.
 */
class NPCActionResolver {
    /**
     * Resolves the final dialogue for an NPC based on their presence and player's faction.
     */
    resolveDialogue(npc, presence, userFactionId = null) {
        // 1. Event Override
        if (presence.status === "EVENT_REACTION" && presence.overrideDialogueId) {
            return `[EVENT: ${presence.eventName}] Greetings! My normal shop is closed during the festival, but I have special items!`;
        }

        // 2. Faction Reactivity
        if (npc.factionId && userFactionId) {
            if (npc.factionId === userFactionId) {
                return `Hail, fellow comrade! It is an honor to serve a member of our faction. How can I assist you today?`;
            } else {
                return `I do not trust your kind. State your business quickly and move on.`;
            }
        }

        // 3. Schedule Override
        if (presence.status === "SCHEDULED") {
            return `I am currently off-duty at this location. Come see me at my shop during the day!`;
        }

        return npc.description; // Default
    }

    /**
     * Determines available interaction types based on presence and faction standing.
     */
    resolveInteractionOptions(npc, presence, userFactionId = null) {
        const options = [];

        // Faction Gating: Enemies cannot trade or take quests
        const isEnemy = npc.factionId && userFactionId && npc.factionId !== userFactionId;

        if (presence.status === "NORMAL" || (presence.status === "EVENT_REACTION" && !presence.targetRegionId)) {
            if (npc.type === "TRADER" && !isEnemy) options.push("TRADE");
            if (npc.type === "QUEST_GIVER" && !isEnemy) options.push("QUEST");
        }

        if (npc.type === "TELEPORTER") options.push("TELEPORT");
        if (npc.type === "HEALER") options.push("HEAL");

        return options;
    }
}

module.exports = new NPCActionResolver();