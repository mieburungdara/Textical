/**
 * AAA NPCActionResolver
 * Pure logic for determining NPC dialogue and interaction overrides.
 */
class NPCActionResolver {
    /**
     * Resolves the final dialogue for an NPC based on their presence state.
     */
    resolveDialogue(npc, presence) {
        if (presence.status === "EVENT_REACTION" && presence.overrideDialogueId) {
            // Logic to fetch override dialogue from model
            return `[EVENT: ${presence.eventName}] Greetings! My normal shop is closed during the festival, but I have special items!`;
        }

        if (presence.status === "SCHEDULED") {
            return `I am currently off-duty at this location. Come see me at my shop during the day!`;
        }

        return npc.description; // Default
    }

    /**
     * Determines available interaction types (Trade, Quest, etc.)
     */
    resolveInteractionOptions(npc, presence) {
        const options = [];

        if (presence.status === "NORMAL" || (presence.status === "EVENT_REACTION" && !presence.targetRegionId)) {
            if (npc.type === "TRADER") options.push("TRADE");
            if (npc.type === "QUEST_GIVER") options.push("QUEST");
        }

        if (npc.type === "TELEPORTER") options.push("TELEPORT");
        if (npc.type === "HEALER") options.push("HEAL");

        return options;
    }
}

module.exports = new NPCActionResolver();
