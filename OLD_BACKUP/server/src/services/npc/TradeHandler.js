/**
 * AAA NPC TradeHandler
 */
const transactionManager = require('../economy/TransactionManager');
const resolver = require('../../logic/economy/CurrencyResolver');
const inventoryService = require('../inventoryService');

class TradeHandler {
    async handlePurchase(prisma, userId, npcId, itemId) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error("User not found.");

            const shopItem = await tx.nPCShopItem.findFirst({
                where: { npcId, itemId }
            });

            if (!shopItem) throw new Error("Item not available.");

            // Use Silver-based total wealth check
            const totalWealthSilver = resolver.getTotalSilver(user);
            if (totalWealthSilver < BigInt(shopItem.priceGold)) {
                throw new Error(`Insufficient funds. Need ${shopItem.priceGold} silver, have: ${totalWealthSilver}`);
            }

            // AAA: Check Localized Dynamic Stock
            const localStock = await tx.shopStock.findFirst({
                where: { npcId, regionId: user.currentRegion, templateId: itemId }
            });

            if (!localStock || localStock.quantity <= 0) {
                throw new Error("This item is currently out of stock in this region.");
            }

            await transactionManager.removeCurrency(tx, userId, shopItem.priceGold, "NPC_PURCHASE", npcId, "NPC");

            // Add to Inventory
            await inventoryService.addItem(userId, itemId, 1, tx);

            // Deduct Dynamic Stock
            await tx.shopStock.update({
                where: { id: localStock.id },
                data: { quantity: { decrement: 1 } }
            });

            return { success: true, message: `Purchased ${localStock.itemTemplate ? '' : ''} for ${shopItem.priceGold} silver.` };
        });
    }
}

module.exports = new TradeHandler();
