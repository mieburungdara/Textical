const BaseService = require('../BaseService');
const marketValidator = require('./MarketValidator');
const transactionManager = require('../economy/TransactionManager');
const marketFee = require('../economy/MarketFeeComponent');

/**
 * MarketTransactionService
 * Orchestrates the complex exchange of items and gold between users.
 * Refactored to use modular TransactionManager and MarketFee components.
 */
class MarketTransactionService extends BaseService {
    constructor() {
        super();
        this.NPC_BUY_RATE = 0.10; // NPC buys at 10% of base value
    }

    async purchaseItem(buyerId, listingId) {
        await marketValidator.verifyInTown(buyerId);

        const listing = await this.db.marketListing.findUnique({
            where: { id: listingId },
            include: { itemInstance: true, seller: true }
        });

        if (!listing) throw new Error("Listing not found or expired.");
        if (listing.sellerId === buyerId) throw new Error("You cannot buy your own item.");

        const totalPrice = listing.pricePerUnit * listing.itemInstance.quantity;
        const sellerNetProfit = marketFee.calculateSellerNet(totalPrice);

        return await this.runTransaction(async (tx) => {
            // 1. Debit Buyer
            await transactionManager.removeGold(tx, buyerId, totalPrice, "MARKET_PURCHASE", listingId, "MARKET");

            // 2. Credit Seller (Net of Tax)
            await transactionManager.addGold(tx, listing.sellerId, sellerNetProfit, "MARKET_SALE", listingId, "MARKET");

            // 3. Ownership Transfer (Strict Relational Merge)
            const existingItem = await tx.inventoryItem.findUnique({
                where: { userId_templateId: { userId: buyerId, templateId: listing.templateId } }
            });

            if (existingItem) {
                await tx.inventoryItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: { increment: listing.itemInstance.quantity } }
                });
                await tx.inventoryItem.delete({ where: { id: listing.itemInstanceId } });
            } else {
                await tx.inventoryItem.update({
                    where: { id: listing.itemInstanceId },
                    data: { userId: buyerId }
                });
            }

            // 4. Cleanup Listing
            await tx.marketListing.delete({ where: { id: listingId } });

            this.log(`Purchase successful: Buyer ${buyerId} bought from ${listing.sellerId}`, "Market");
            return { success: true, message: "Purchase complete." };
        });
    }

    async npcSell(userId, itemInstanceId) {
        await marketValidator.verifyInTown(userId);

        const item = await this.db.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true, marketListing: true, equippedIn: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found.");
        if (item.marketListing || item.equippedIn) throw new Error("Item is currently locked (Market/Equipped).");

        const totalPayout = Math.floor(item.template.baseValue * this.NPC_BUY_RATE) * item.quantity;

        return await this.runTransaction(async (tx) => {
            await transactionManager.addGold(tx, userId, totalPayout, "NPC_SELL", item.templateId, "ITEM");
            await tx.inventoryItem.delete({ where: { id: itemInstanceId } });

            this.log(`NPC Sell successful: User ${userId} sold Item ${item.templateId}`, "Market");
            return { success: true, payout: totalPayout };
        });
    }
}

module.exports = new MarketTransactionService();