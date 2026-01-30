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

        switch (action) {
            case "PURCHASE":
                return await this._handlePurchase(userId, npcId, params.itemId);
            case "PROMOTE":
                return await promotionService.promoteHero(heroId, params.targetClassId);
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

            // 1. Deduct Gold
            await tx.user.update({
                where: { id: userId },
                data: { gold: { decrement: shopItem.priceGold } }
            });

            // 2. Add Item to Inventory
            await tx.inventoryItem.upsert({
                where: { userId_templateId: { userId, templateId: itemId } },
                update: { quantity: { increment: 1 } },
                create: { userId, templateId: itemId, quantity: 1 }
            });

            // 3. Update Stock if not infinite
            if (shopItem.stock > 0) {
                await tx.nPCShopItem.update({
                    where: { id: shopItem.id },
                    data: { stock: { decrement: 1 } }
                });
            }

            return { success: true, message: `Purchased item for ${shopItem.priceGold} gold.` };
        });
    }
}

module.exports = new NPCService();
