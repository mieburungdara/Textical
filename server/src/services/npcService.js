const BaseService = require('./BaseService');
const tradeHandler = require('./npc/TradeHandler');
const interactionHandler = require('./npc/InteractionHandler');
const promotionService = require('./promotionService');
const behaviorService = require('./npc/NPCBehaviorService');
const actionResolver = require('../logic/npc/NPCActionResolver');

/**
 * NPCService
 * Thin orchestrator for world inhabitants and interactions.
 * Enhanced with Advanced AI and Faction Reactivity.
 */
class NPCService extends BaseService {
    /**
     * Resolves and returns NPCs currently present in a region with faction context.
     */
    async getAvailableNPCs(regionId, userId = null) {
        const currentHour = new Date().getHours(); 
        
        let userFactionId = null;
        if (userId) {
            const user = await this.db.user.findUnique({ where: { id: userId } });
            userFactionId = user ? user.factionId : null;
        }

        const npcs = await behaviorService.getNPCsInRegion(regionId, currentHour);

        return npcs.map(npc => {
            const presence = npc.currentPresence;
            return {
                instanceId: `dyn_${npc.id}`,
                templateId: npc.id,
                name: npc.name,
                title: npc.title,
                type: npc.type,
                description: actionResolver.resolveDialogue(npc, presence, userFactionId),
                interactionOptions: actionResolver.resolveInteractionOptions(npc, presence, userFactionId),
                presenceStatus: presence.status,
                shop: npc.shopItems,
                teleportRoutes: npc.teleportRoutes
            };
        });
    }

    async interactWithNPC(userId, heroId, npcId, action, params = {}) {
        const currentHour = new Date().getHours();
        const user = await this.db.user.findUnique({ where: { id: userId } });
        const userFactionId = user ? user.factionId : null;

        const npc = await this.db.nPCTemplate.findUnique({ 
            where: { id: npcId },
            include: { teleportRoutes: true }
        });
        if (!npc) throw new Error("NPC not found.");

        const presence = await behaviorService.resolveNPCPresence(npcId, currentHour);
        const options = actionResolver.resolveInteractionOptions(npc, presence, userFactionId);

        this.log(`Hero ${heroId} interacting with ${npc.name} (${action})`, "NPC");

        const mappedAction = (action === "PURCHASE") ? "TRADE" : action;
        if (!options.includes(mappedAction) && !["TELEPORT", "HEAL", "GAMBLE"].includes(action)) {
            throw new Error(`This NPC is currently unable to perform ${action} for your faction standing.`);
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