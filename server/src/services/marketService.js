const BaseService = require('./BaseService');
const marketValidator = require('./market/MarketValidator');
const orderManager = require('./market/MarketOrderManager');
const orderMatcher = require('./market/OrderMatcher');
const listingService = require('./market/MarketListingService');
const transactionManager = require('./economy/TransactionManager');
const resolver = require('../logic/economy/CurrencyResolver');

/**
 * MarketService
 * Thin orchestrator for Albion-Style Localized Orders.
 * Refactored to handle dynamic Buy/Sell orders and immediate matching.
 */
class MarketService extends BaseService {
    /**
     * Archive expired listings.
     */
    async archiveExpiredListings() {
        return await listingService.archiveExpiredListings();
    }

    /**
     * Get active listings.
     */
    async getActiveListings(userId) {
        return await listingService.getActiveListings(userId);
    }

    /**
     * List item for sale.
     */
    async listItem(userId, itemId, price) {
        return await listingService.listItem(userId, itemId, price);
    }

    /**
     * Purchase item from market.
     * Buyer pays gold and receives the item.
     */
    async purchaseItem(userId, listingId) {
        return await this.runTransaction(async (tx) => {
            // 1. Get the listing
            const listing = await tx.marketListing.findUnique({
                where: { id: listingId },
                include: { itemTemplate: true, seller: true }
            });

            if (!listing) {
                throw new Error("Listing not found.");
            }

            if (listing.status !== 'ACTIVE') {
                throw new Error("Listing is no longer available.");
            }

            if (listing.sellerId === userId) {
                throw new Error("You cannot buy your own listing.");
            }

            // 2. Verify buyer has enough funds (Silver-based)
            const buyer = await tx.user.findUnique({ where: { id: userId } });
            const buyerTotalSilver = resolver.getTotalSilver(buyer);
            if (buyerTotalSilver < BigInt(listing.price)) {
                throw new Error(`Insufficient funds. Need ${listing.price} silver, have ${buyerTotalSilver}`);
            }

            // 3. Transfer silver to seller
            await transactionManager.removeCurrency(tx, userId, listing.price, "MARKET_BUY", listing.id, "LISTING");
            await transactionManager.addCurrency(tx, listing.sellerId, listing.price, "MARKET_SELL", listing.id, "LISTING");

            // 4. Create item for buyer
            const purchasedItem = await tx.inventoryItem.create({
                data: {
                    userId: userId,
                    templateId: listing.itemTemplateId,
                    quantity: listing.quantity,
                    isEquipped: false
                }
            });

            // 5. Update listing status
            await tx.marketListing.update({
                where: { id: listingId },
                data: { status: 'SOLD' }
            });

            this.log(`User ${userId} purchased ${listing.quantity}x ${listing.itemTemplate.name} for ${listing.price} silver from user ${listing.sellerId}`, "Market");

            return { success: true, item: purchasedItem, cost: listing.price };
        });
    }

    /**
     * Sell item to NPC.
     * Instant sell with 90% penalty (10% of base value).
     */
    async npcSell(userId, itemId) {
        return await this.runTransaction(async (tx) => {
            // 1. Get the item
            const item = await tx.inventoryItem.findUnique({
                where: { id: itemId },
                include: { template: true }
            });

            if (!item) {
                throw new Error("Item not found in inventory.");
            }

            if (item.userId !== userId) {
                throw new Error("Item does not belong to you.");
            }

            if (item.isEquipped) {
                throw new Error("Cannot sell equipped items.");
            }

            // 2. Fence Logic (Stolen Goods)
            const user = await tx.user.findUnique({ 
                where: { id: userId }, 
                include: { region: true } 
            });

            if (item.isStolen && !user.region.isBanditHideout) {
                throw new Error("Penyelundup! Pedagang jujur tidak akan menerima barang curian ini. Cari penadah di sarang penjahat.");
            }

            // 3. Calculate NPC sell price (90% penalty) in Silver
            const baseValue = item.template.baseValue || 1;
            const sellPriceSilver = BigInt(Math.floor(baseValue * 0.9));

            // 4. Add silver to user via TransactionManager
            await transactionManager.addCurrency(tx, userId, sellPriceSilver, "NPC_SELL", itemId, "INVENTORY_ITEM");

            // 4. Remove item from inventory
            await tx.inventoryItem.delete({
                where: { id: itemId }
            });

            this.log(`User ${userId} sold ${item.template.name} to NPC for ${sellPriceSilver} silver (base: ${baseValue})`, "Market");

            return { success: true, itemName: item.template.name, sellPrice: sellPriceSilver };
        });
    }

    /**
     * Create a Sell Order via ListingService (handles taxes) and attempt immediate matching.
     */
    async createSellOrder(userId, itemInstanceId, quantity, pricePerUnit) {
        // 1. Use ListingService to handle upfront taxes and order creation
        const order = await listingService.listItem(userId, itemInstanceId, pricePerUnit);

        // 2. Attempt immediate matching
        return await this.runTransaction(async (tx) => {
            await orderMatcher.matchSellOrder(tx, order);
            return order;
        });
    }

    /**
     * Create a Buy Order and attempt immediate matching.
     */
    async createBuyOrder(userId, templateId, quantity, pricePerUnit) {
        const user = await marketValidator.verifyInTown(userId);

        return await this.runTransaction(async (tx) => {
            const order = await orderManager.createBuyOrder(tx, userId, user.currentRegion, templateId, quantity, pricePerUnit);
            await orderMatcher.matchBuyOrder(tx, order);

            this.log(`Buy Order created: User ${userId} requested ${quantity} units at ${pricePerUnit} in Region ${user.currentRegion}`, "Market");
            return order;
        });
    }

    /**
     * Fetch active orders visible in the user's current region.
     */
    async getRegionalOrders(userId, type = "SELL") {
        const user = await this.db.user.findUnique({ where: { id: userId } });
        return await this.db.marketOrder.findMany({
            where: { 
                regionId: user.currentRegion, 
                type,
                status: "OPEN",
                expiresAt: { gt: new Date() }
            },
            include: { itemTemplate: true, creator: true },
            orderBy: { pricePerUnit: type === "SELL" ? "asc" : "desc" }
        });
    }

    /**
     * Cancel an order and refund escrow.
     */
    async cancelOrder(userId, orderId) {
        return await this.runTransaction(async (tx) => {
            // 1. Get the order
            const order = await tx.marketOrder.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                throw new Error("Order not found.");
            }

            if (order.creatorId !== userId) {
                throw new Error("You can only cancel your own orders.");
            }

            if (order.status !== 'OPEN') {
                throw new Error("Only open orders can be cancelled.");
            }

            // 2. Refund escrow to user
            const escrowRefund = BigInt(order.quantity * order.pricePerUnit);
            await transactionManager.addCurrency(tx, userId, escrowRefund, "ORDER_CANCEL", orderId, "MARKET_ORDER");

            // 3. Update order status
            await tx.marketOrder.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });

            this.log(`User ${userId} cancelled order ${orderId}, refunded ${escrowRefund} silver`, "Market");

            return { success: true, refundedAmount: escrowRefund };
        });
    }
}

module.exports = new MarketService();
