/**
 * AAA NPC TradeHandler
 */
class TradeHandler {
    async handlePurchase(prisma, userId, npcId, itemId) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error("User not found.");

            const shopItem = await tx.nPCShopItem.findFirst({
                where: { npcId, itemId }
            });

            if (!shopItem) throw new Error("Item not available.");

            const resolver = require('../../logic/economy/CurrencyResolver');
            const totalWealth = resolver.getTotalCopper(user);
            if (totalWealth < shopItem.priceGold) throw new Error("Insufficient funds across all currency tiers.");

            // AAA: Check Localized Dynamic Stock
            const localStock = await tx.shopStock.findFirst({
                where: { npcId, regionId: user.currentRegion, templateId: itemId }
            });

            if (!localStock || localStock.quantity <= 0) {
                throw new Error("This item is currently out of stock in this region.");
            }

            const transactionManager = require('../economy/TransactionManager');
            await transactionManager.removeCurrency(tx, userId, shopItem.priceGold, "NPC_PURCHASE", npcId, "NPC");

            // Add to Inventory
            const inventoryService = require('../inventoryService');
            await inventoryService.addItem(userId, itemId, 1, tx);

            // Deduct Dynamic Stock
            await tx.shopStock.update({
                where: { id: localStock.id },
                data: { quantity: { decrement: 1 } }
            });

            return { success: true, message: `Purchased ${localStock.itemTemplate ? '' : ''} for ${shopItem.priceGold} gold.` };
        });
    }
}

module.exports = new TradeHandler();
