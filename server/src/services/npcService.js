const BaseService = require('./BaseService');
const tradeHandler = require('./npc/TradeHandler');
const interactionHandler = require('./npc/InteractionHandler');
const promotionService = require('./promotionService');
const behaviorService = require('./npc/NPCBehaviorService');
const actionResolver = require('../logic/npc/NPCActionResolver');

/**
 * NPCService
 * Thin orchestrator for world inhabitants and interactions.
 * Enhanced with Advanced AI (Presence & Behavior Overrides).
 */
class NPCService extends BaseService {
    /**
     * Resolves and returns NPCs currently present in a region.
     */
    async getAvailableNPCs(regionId) {
        // In a real server, this would come from a Global Clock service
        const currentHour = new Date().getHours(); 

        const npcs = await behaviorService.getNPCsInRegion(regionId, currentHour);

        return npcs.map(npc => {
            const presence = npc.currentPresence;
            return {
                instanceId: `dyn_${npc.id}`,
                templateId: npc.id,
                name: npc.name,
                title: npc.title,
                type: npc.type,
                // Resolve dynamic dialogue via ActionResolver
                description: actionResolver.resolveDialogue(npc, presence),
                interactionOptions: actionResolver.resolveInteractionOptions(npc, presence),
                presenceStatus: presence.status,
                shop: npc.shopItems,
                teleportRoutes: npc.teleportRoutes
            };
        });
    }

    async interactWithNPC(userId, heroId, npcId, action, params = {}) {
        const currentHour = new Date().getHours();
        const npc = await this.db.nPCTemplate.findUnique({ 
            where: { id: npcId },
            include: { teleportRoutes: true }
        });
        if (!npc) throw new Error("NPC not found.");

        const presence = await behaviorService.resolveNPCPresence(npcId, currentHour);
        const options = actionResolver.resolveInteractionOptions(npc, presence);

        this.log(`Hero ${heroId} interacting with ${npc.name} (${action})`, "NPC");

        // Validate if the requested action is available in current presence state
        // For simple actions like PURCHASE, we check if TRADE is in options
        const mappedAction = (action === "PURCHASE") ? "TRADE" : action;
        if (!options.includes(mappedAction) && !["TELEPORT", "HEAL", "GAMBLE"].includes(action)) {
            throw new Error(`This NPC is currently unable to perform ${action}.`);
        }

        switch (action) {
            case "PURCHASE":
                return await tradeHandler.handlePurchase(this.db, userId, npcId, params.itemId);
            case "PROMOTE":
                return await promotionService.promoteHero(heroId, params.targetClassId);
            case "GAMBLE":
                return await interactionHandler.handleGamble(this.db, userId, npc, params.betAmount);
            case "TELEPORT":
                return await this._handleTeleport(userId, npc, params.destinationId);
            case "BUFF":
                return await interactionHandler.handleBuff(this.db, heroId, userId, npc);
            case "HEAL":
                return await interactionHandler.handleHeal(this.db, heroId, userId, npc);
            default:
                throw new Error(`Action ${action} not supported.`);
        }
    }

    async _handleTeleport(userId, npc, destId) {
        const validRoute = npc.teleportRoutes.find(r => r.targetRegionId === destId);
        if (!validRoute) throw new Error("This NPC cannot teleport you there.");
        
        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            const cost = npc.travelCost || 200;
            if (user.gold < cost) throw new Error("Insufficient gold.");

            await tx.user.update({
                where: { id: userId },
                data: { gold: { decrement: cost }, currentRegion: destId }
            });

            return { success: true, message: `Teleported to Region ${destId}.` };
        });
    }
}

module.exports = new NPCService();
