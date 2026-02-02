const factionWarService = require('../../services/faction/FactionWarService');

/**
 * AAA NPCActionResolver
 * Pure logic for determining NPC dialogue and interaction overrides.
 */
class NPCActionResolver {
    /**
     * Resolves the final dialogue and state for an NPC.
     */
    async resolveFullState(tx, npc, presence = null, userFactionId = null, reputation = 0) {
        const relation = await factionWarService.getRelation(userFactionId, npc.factionId);
        const isAtWar = relation === "WAR";
        const isTraitor = reputation < -1000;
        
        const pStatus = presence ? presence.status : "NORMAL";

        const state = {
            dialogue: npc.description,
            options: [],
            triggerCombat: false,
            isHostile: isAtWar || isTraitor,
            dynamicQuests: [] // AAA: Dynamic Merchant Quests
        };

        // --- AAA: Check for Dynamic Quests (Shortages) ---
        // For simplicity, we assume dynamic quests are named with a pattern or flag.
        if (["TRADER", "MERCHANT"].includes(npc.type)) {
            const now = new Date();
            const activeDynamic = await tx.questTemplate.findMany({
                where: { 
                    isDynamic: true, 
                    expiresAt: { gt: now },
                    description: { contains: npc.name } // Logic check: NPC name embedded in desc
                }
            });
            if (activeDynamic.length > 0) {
                state.options.push("DYNAMIC_QUEST");
                state.dynamicQuests = activeDynamic.map(q => ({ id: q.id, name: q.name }));
            }
        }

        // 1. Resolve Dialogue
        if (isTraitor) {
            state.dialogue = `[TRAITOR DETECTED] Stop right there, criminal! You are wanted dead or alive!`;
            state.triggerCombat = ["GUARD", "SOLDIER", "CAPTAIN"].includes(npc.type);
        } else if (isAtWar) {
            state.dialogue = `[ENEMY DETECTED] Guards! Seize this intruder from the enemy faction immediately!`;
            state.triggerCombat = ["GUARD", "SOLDIER", "CAPTAIN"].includes(npc.type) || (Math.random() < 0.2);
        } else if (presence && presence.status === "EVENT_REACTION" && presence.overrideDialogueId) {
            state.dialogue = `[EVENT: ${presence.eventName}] Greetings! My normal shop is closed during the festival, but I have special items!`;
        } else if (npc.factionId && userFactionId === npc.factionId) {
            state.dialogue = `Hail, fellow comrade! It is an honor to serve a member of our faction. How can I assist you today?`;
        }

        // 2. Resolve Interaction Options
        // Always available neutral services
        if (npc.type === "TELEPORTER") state.options.push("TELEPORT");
        if (npc.type === "HEALER") state.options.push("HEAL");

        // Faction/Reputation Gated services
        if (!isAtWar && !isTraitor) {
            // Support multiple type naming conventions if any
            if (npc.type === "TRADER" || npc.type === "MERCHANT") state.options.push("TRADE");
            if (npc.type === "QUEST_GIVER") state.options.push("QUEST");
            if (npc.type === "GAMBLER") state.options.push("GAMBLE");
            if (npc.type === "JOB_CHANGER") state.options.push("PROMOTE");
        }

        return state;
    }
}

module.exports = new NPCActionResolver();