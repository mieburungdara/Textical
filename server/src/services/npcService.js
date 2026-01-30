const BaseService = require('./BaseService');
const tradeHandler = require('./npc/TradeHandler');
const interactionHandler = require('./npc/InteractionHandler');
const promotionService = require('./promotionService');

/**
 * NPCService
 * Thin orchestrator for world inhabitants and interactions.
 * Refactored for strictly relational data.
 */
class NPCService extends BaseService {
    async getAvailableNPCs(regionId) {
        const now = new Date();
        const regionNPCs = await this.db.regionNPC.findMany({
            where: {
                regionId,
                OR: [{ isTemporary: false }, { expiresAt: { gt: now } }]
            },
            include: { 
                npc: { 
                    include: { 
                        shopItems: { include: { item: true } },
                        teleportRoutes: true
                    } 
                } 
            }
        });

        return regionNPCs.map(rn => ({
            instanceId: rn.id, templateId: rn.npc.id,
            name: rn.npc.name, title: rn.npc.title,
            type: rn.npc.type, description: rn.npc.description,
            shop: rn.npc.shopItems,
            teleportRoutes: rn.npc.teleportRoutes
        }));
    }

    async interactWithNPC(userId, heroId, npcId, action, params = {}) {
        const npc = await this.db.nPCTemplate.findUnique({ 
            where: { id: npcId },
            include: { teleportRoutes: true }
        });
        if (!npc) throw new Error("NPC not found.");

        this.log(`Hero ${heroId} interacting with ${npc.name} (${action})`, "NPC");

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