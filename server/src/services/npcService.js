const prisma = require('../db');
const promotionService = require('./promotionService');

class NPCService {
    /**
     * Get all active NPCs in a specific region
     */
    async getAvailableNPCs(regionId) {
        const now = new Date();
        const regionNPCs = await prisma.regionNPC.findMany({
            where: {
                regionId,
                OR: [
                    { isTemporary: false },
                    { expiresAt: { gt: now } }
                ]
            },
            include: { npc: { include: { shopItems: { include: { item: true } } } } }
        });

        return regionNPCs.map(rn => ({
            instanceId: rn.id,
            templateId: rn.npc.id,
            name: rn.npc.name,
            title: rn.npc.title,
            type: rn.npc.type,
            description: rn.npc.description,
            shop: rn.npc.shopItems,
            metadata: JSON.parse(rn.npc.metadata)
        }));
    }

    /**
     * AAA Unified NPC Interaction Logic
     */
    async interactWithNPC(userId, heroId, npcId, action, params = {}) {
        const npc = await prisma.nPCTemplate.findUnique({ where: { id: npcId } });
        if (!npc) throw new Error("NPC not found.");
        const meta = JSON.parse(npc.metadata);

        switch (action) {
            case "PURCHASE":
                return await this._handlePurchase(userId, npcId, params.itemId);
            case "PROMOTE":
                return await promotionService.promoteHero(heroId, params.targetClassId);
            case "GAMBLE":
                return await this._handleGamble(userId, npcId, meta, params.betAmount);
            case "TELEPORT":
                return await this._handleTeleport(userId, npcId, meta, params.destinationId);
            case "BUFF":
                return await this._handleBuff(userId, heroId, npcId, meta);
            case "HEAL":
                return await this._handleHeal(userId, heroId, npcId, meta);
            default:
                throw new Error(`Action ${action} not supported for this NPC.`);
        }
    }

    async _handlePurchase(userId, npcId, itemId) {
        return await prisma.$transaction(async (tx) => {
            const shopItem = await tx.nPCShopItem.findFirst({
                where: { npcId, itemId }
            });

            if (!shopItem) throw new Error("Item not available in this shop.");
            if (shopItem.stock === 0) throw new Error("Out of stock.");

            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.gold < shopItem.priceGold) throw new Error("Insufficient gold.");

            await tx.user.update({
                where: { id: userId },
                data: { gold: { decrement: shopItem.priceGold } }
            });

            await tx.inventoryItem.upsert({
                where: { userId_templateId: { userId, templateId: itemId } },
                update: { quantity: { increment: 1 } },
                create: { userId, templateId: itemId, quantity: 1 }
            });

            if (shopItem.stock > 0) {
                await tx.nPCShopItem.update({ where: { id: shopItem.id }, data: { stock: { decrement: 1 } } });
            }

            return { success: true, message: `Purchased item for ${shopItem.priceGold} gold.` };
        });
    }

    async _handleGamble(userId, npcId, meta, bet) {
        if (!bet || bet < meta.minBet || bet > meta.maxBet) throw new Error(`Bet must be between ${meta.minBet} and ${meta.maxBet}.`);

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.gold < bet) throw new Error("Insufficient gold.");

            const won = Math.random() < meta.winChance;
            const delta = won ? Math.floor(bet * (meta.winMultiplier - 1)) : -bet;

            await tx.user.update({
                where: { id: userId },
                data: { gold: { increment: delta } }
            });

            return {
                success: won,
                message: won ? `Fortune smiles! You won ${delta} gold!` : `Better luck next time. You lost ${bet} gold.`,
                newBalance: user.gold + delta
            };
        });
    }

    async _handleTeleport(userId, npcId, meta, destinationId) {
        if (!meta.destinationRegions.includes(destinationId)) throw new Error("Invalid destination.");

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.gold < meta.costPerTravel) throw new Error("Insufficient gold.");

            await tx.user.update({
                where: { id: userId },
                data: { 
                    gold: { decrement: meta.costPerTravel },
                    currentRegion: destinationId
                }
            });

            return { success: true, message: `Rift opened. Teleported to region ${destinationId}.` };
        });
    }

    async _handleBuff(userId, heroId, npcId, meta) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.gold < meta.costGold) throw new Error("Insufficient gold.");

            await tx.user.update({ where: { id: userId }, data: { gold: { decrement: meta.costGold } } });

            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + meta.durationSeconds);

            await tx.heroBuff.create({
                data: {
                    heroId,
                    name: meta.buffName,
                    statKey: meta.statKey,
                    statValue: meta.statValue,
                    expiresAt
                }
            });

            return { success: true, message: `Received ${meta.buffName} buff.` };
        });
    }

    async _handleHeal(userId, heroId, npcId, meta) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (meta.healCost > 0 && user.gold < meta.healCost) throw new Error("Insufficient gold.");

            if (meta.healCost > 0) {
                await tx.user.update({ where: { id: userId }, data: { gold: { decrement: meta.healCost } } });
            }

            // Restore hero HP (Simple reset to max calculated)
            // Note: In real engine we'd fetch stats first, but let's assume full restore logic exists.
            await tx.hero.update({
                where: { id: heroId },
                data: { vitality: 100 } // Vitality restore as a proxy for healing
            });

            return { success: true, message: "Healing complete. Your strength is restored." };
        });
    }
}

module.exports = new NPCService();