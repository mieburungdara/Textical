/**
 * AAA NPC TradeHandler
 */
class TradeHandler {
    async handlePurchase(prisma, userId, npcId, itemId) {
        return await prisma.$transaction(async (tx) => {
            const shopItem = await tx.nPCShopItem.findFirst({
                where: { npcId, itemId }
            });

            if (!shopItem) throw new Error("Item not available.");
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

            return { success: true, message: `Purchased for ${shopItem.priceGold} gold.` };
        });
    }
}

module.exports = new TradeHandler();
