const BaseService = require('./BaseService');
const tradeHandler = require('./npc/TradeHandler');
const interactionHandler = require('./npc/InteractionHandler');
const promotionService = require('./promotionService');
const behaviorService = require('./npc/NPCBehaviorService');
const actionResolver = require('../logic/npc/NPCActionResolver');
const factionWarService = require('./faction/FactionWarService');
const koManager = require('./vitality/KOManager');
const transactionManager = require('./economy/TransactionManager');
const resolver = require('../logic/economy/CurrencyResolver');

/**
 * NPCService
 * Thin orchestrator for world inhabitants and interactions.
 * Enhanced with Advanced AI, Faction Reactivity, and Hostility Combat.
 */
class NPCService extends BaseService {
    /**
     * Resolves and returns NPCs currently present in a region with faction context.
     */
    async getAvailableNPCs(regionId, userId = null, hour = null) {
        let userFactionId = null;
        if (userId) {
            // AAA: KO Check
            const isKO = await koManager.isKnockedOut(userId);
            if (isKO) return []; // Unconscious players see no NPCs

            const user = await this.db.user.findUnique({ where: { id: userId } });
            userFactionId = user ? user.factionId : null;
        }

        const npcs = await behaviorService.getNPCsInRegion(regionId, hour);

        const results = [];
        for (const npc of npcs) {
            const presence = npc.currentPresence;
            try {
                const fullState = await actionResolver.resolveFullState(this.db, npc, presence, userFactionId);

                results.push({
                    instanceId: npc.instanceId || `dyn_${npc.id}`,
                    templateId: npc.id,
                    name: npc.name,
                    title: npc.title,
                    type: npc.type,
                    description: fullState.dialogue,
                    interactionOptions: fullState.options,
                    presenceStatus: presence.status,
                    isHostile: fullState.isHostile,
                    triggerCombat: fullState.triggerCombat,
                    shop: npc.shopItems || [],
                    teleportRoutes: npc.teleportRoutes || []
                });
            } catch (e) {
                this.handleError(e, `NPC Discovery [${npc.id || npc.instanceId}]`);
            }
        }
        return results;
    }

    async interactWithNPC(userId, heroId, npcId, action, params = {}, hour = null) {
        // AAA: KO Check
        const isKO = await koManager.isKnockedOut(userId);
        if (isKO) throw new Error("You are unconscious.");

        const user = await this.db.user.findUnique({ where: { id: userId } });
        const userFactionId = user ? user.factionId : null;

        const npc = await this.db.nPCTemplate.findUnique({ 
            where: { id: npcId },
            include: { teleportRoutes: true }
        });
        if (!npc) throw new Error("NPC not found.");

        const presence = await behaviorService.resolveNPCPresence(npcId, hour);
        const fullState = await actionResolver.resolveFullState(this.db, npc, presence, userFactionId);

        if (fullState.triggerCombat) {
            return { type: "COMBAT_TRIGGERED", message: "The NPC has engaged you in battle!" };
        }

        const mappedAction = (action === "PURCHASE") ? "TRADE" : action;
        if (!fullState.options.includes(mappedAction) && !["TELEPORT", "HEAL", "GAMBLE"].includes(action)) {
            throw new Error(`This NPC refuses to ${action} with an enemy of their faction.`);
        }

        switch (action) {
            case "PURCHASE":
                return await tradeHandler.handlePurchase(this.db, userId, npcId, params.itemId);
            case "PROMOTE":
                return await promotionService.promoteHero(heroId, params.targetClassId);
            case "GAMBLE":
                return await interactionHandler.handleGamble(this.db, userId, npc, params.betAmount);
            case "TELEPORT":
                return await this._handleTeleport(userId, npc, params.destinationId, fullState.isHostile);
            case "BUFF":
                return await interactionHandler.handleBuff(this.db, heroId, userId, npc);
            case "HEAL":
                return await interactionHandler.handleHeal(this.db, heroId, userId, npc, fullState.isHostile);
            default:
                throw new Error(`Action ${action} not supported.`);
        }
    }

    async _handleTeleport(userId, npc, destId, isHostile = false) {
        const validRoute = npc.teleportRoutes.find(r => r.targetRegionId === destId);
        if (!validRoute) throw new Error("This NPC cannot teleport you there.");
        
        // AAA: Royal City Restriction
        const user = await this.db.user.findUnique({ 
            where: { id: userId },
            include: { region: true }
        });

        // 1. Origin must be ROYAL
        if (user.region.zoneType !== 'ROYAL') {
            throw new Error("Teleportation services are only available in Royal Cities.");
        }

        // 2. Target must be ROYAL
        const targetRegion = await this.db.regionTemplate.findUnique({ where: { id: destId } });
        if (!targetRegion || targetRegion.zoneType !== 'ROYAL') {
            throw new Error("You can only teleport between Royal Cities.");
        }

        return await this.runTransaction(async (tx) => {
            let costSilver = BigInt(npc.travelCost || 200);
            if (isHostile) costSilver *= BigInt(2);

            const userTotalSilver = resolver.getTotalSilver(user);
            if (userTotalSilver < costSilver) {
                throw new Error(`Insufficient funds. Need ${costSilver} silver, have: ${userTotalSilver}`);
            }

            await transactionManager.removeCurrency(tx, userId, costSilver, "TELEPORT", destId, "NPC_ROUTE");
            await transactionManager.updateLocation(tx, userId, destId);

            return { success: true, message: `Teleported to ${targetRegion.name}.` };
        });
    }
}

module.exports = new NPCService();
