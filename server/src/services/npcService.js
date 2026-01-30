const BaseService = require('./BaseService');
const tradeHandler = require('./npc/TradeHandler');
const interactionHandler = require('./npc/InteractionHandler');
const promotionService = require('./promotionService');

/**
 * NPCService
 * Thin orchestrator for world inhabitants and interactions.
 */
class NPCService extends BaseService {
    async getAvailableNPCs(regionId) {
        const now = new Date();
        const regionNPCs = await this.db.regionNPC.findMany({
            where: {
                regionId,
                OR: [{ isTemporary: false }, { expiresAt: { gt: now } }]
            },
            include: { npc: { include: { shopItems: { include: { item: true } } } } }
        });

        return regionNPCs.map(rn => ({
            instanceId: rn.id, templateId: rn.npc.id,
            name: rn.npc.name, title: rn.npc.title,
            type: rn.npc.type, description: rn.npc.description,
            shop: rn.npc.shopItems,
            metadata: JSON.parse(rn.npc.metadata)
        }));
    }

    async interactWithNPC(userId, heroId, npcId, action, params = {}) {
        const npc = await this.db.nPCTemplate.findUnique({ where: { id: npcId } });
        if (!npc) throw new Error("NPC not found.");
        const meta = JSON.parse(npc.metadata);

        this.log(`Hero ${heroId} interacting with ${npc.name} (${action})`, "NPC");

        switch (action) {
            case "PURCHASE":
                return await tradeHandler.handlePurchase(this.db, userId, npcId, params.itemId);
            case "PROMOTE":
                return await promotionService.promoteHero(heroId, params.targetClassId);
            case "GAMBLE":
                return await interactionHandler.handleGamble(this.db, userId, meta, params.betAmount);
            case "TELEPORT":
                return await this._handleTeleport(userId, meta, params.destinationId);
            case "BUFF":
                return await interactionHandler.handleBuff(this.db, heroId, userId, meta);
            case "HEAL":
                return await interactionHandler.handleHeal(this.db, heroId, userId, meta);
            default:
                throw new Error(`Action ${action} not supported.`);
        }
    }

    async _handleTeleport(userId, meta, destId) {
        if (!meta.destinationRegions.includes(destId)) throw new Error("Invalid destination.");
        
        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.gold < meta.costPerTravel) throw new Error("Insufficient gold.");

            await tx.user.update({
                where: { id: userId },
                data: { gold: { decrement: meta.costPerTravel }, currentRegion: destId }
            });

            return { success: true, message: `Teleported to ${destId}.` };
        });
    }
}

module.exports = new NPCService();
