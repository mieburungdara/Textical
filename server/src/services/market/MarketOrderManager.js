const transactionManager = require('../economy/TransactionManager');

/**
 * AAA MarketOrderManager
 * Handles the creation, cancellation, and validation of Buy/Sell orders.
 */
class MarketOrderManager {
    /**
     * Creates a Sell Order (Listing an item for sale).
     */
    async createSellOrder(tx, userId, regionId, itemInstanceId, quantity, pricePerUnit) {
        const item = await tx.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found.");
        if (item.quantity < quantity) throw new Error("Insufficient quantity.");

        // Create Order
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24); // 24hr default

        return await tx.marketOrder.create({
            data: {
                creatorId: userId,
                regionId,
                templateId: item.templateId,
                type: "SELL",
                pricePerUnit,
                initialQuantity: quantity,
                remainingQuantity: quantity,
                itemInstanceId,
                expiresAt: expiry
            }
        });
    }

    /**
     * Creates a Buy Order (Escrowing gold to request an item).
     */
    async createBuyOrder(tx, userId, regionId, templateId, quantity, pricePerUnit) {
        const totalEscrow = quantity * pricePerUnit;

        // 1. Escrow Gold (Debit User)
        await transactionManager.removeGold(tx, userId, totalEscrow, "MARKET_ESCROW", templateId, "BUY_ORDER");

        // 2. Create Order
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 48); // 48hr for buy orders

        return await tx.marketOrder.create({
            data: {
                creatorId: userId,
                regionId,
                templateId,
                type: "BUY",
                pricePerUnit,
                initialQuantity: quantity,
                remainingQuantity: quantity,
                expiresAt: expiry
            }
        });
    }
}

module.exports = new MarketOrderManager();
