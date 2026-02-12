const BaseService = require('./BaseService');
const marketValidator = require('./market/MarketValidator');
const orderManager = require('./market/MarketOrderManager');
const orderMatcher = require('./market/OrderMatcher');
const listingService = require('./market/MarketListingService');

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

            // 2. Verify buyer has enough gold
            const buyer = await tx.user.findUnique({ where: { id: userId } });
            if (buyer.gold < listing.price) {
                throw new Error(`Insufficient gold. Need ${listing.price}, have ${buyer.gold}`);
            }

            // 3. Transfer gold to seller
            await tx.user.update({
                where: { id: userId },
                data: { gold: buyer.gold - listing.price }
            });

            await tx.user.update({
                where: { id: listing.sellerId },
                data: { gold: listing.seller.gold + listing.price }
            });

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

            // 6. Log transaction
            await tx.transactionLedger.create({
                data: {
                    userId,
                    type: 'MARKET_BUY',
                    currencyTier: 'GOLD',
                    amountDelta: -listing.price,
                    newBalance: buyer.gold - listing.price,
                    metadata: JSON.stringify({
                        listingId,
                        itemId: listing.itemTemplateId,
                        quantity: listing.quantity,
                        sellerId: listing.sellerId
                    })
                }
            });

            this.log(`User ${userId} purchased ${listing.quantity}x ${listing.itemTemplate.name} for ${listing.price} gold from user ${listing.sellerId}`, "Market");

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

            // 2. Calculate NPC sell price (90% penalty)
            const baseValue = item.template.baseValue || 1;
            const sellPrice = Math.floor(baseValue * 0.9);

            // 3. Update user gold
            const user = await tx.user.findUnique({ where: { id: userId } });
            await tx.user.update({
                where: { id: userId },
                data: { gold: user.gold + sellPrice }
            });

            // 4. Remove item from inventory
            await tx.inventoryItem.delete({
                where: { id: itemId }
            });

            // 5. Log transaction
            await tx.transactionLedger.create({
                data: {
                    userId,
                    type: 'NPC_SELL',
                    currencyTier: 'GOLD',
                    amountDelta: sellPrice,
                    newBalance: user.gold + sellPrice,
                    metadata: JSON.stringify({
                        itemId,
                        itemName: item.template.name,
                        baseValue,
                        sellPrice
                    })
                }
            });

            this.log(`User ${userId} sold ${item.template.name} to NPC for ${sellPrice} gold (base: ${baseValue})`, "Market");

            return { success: true, itemName: item.template.name, sellPrice };
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

            // 2. Refund escrow
            const user = await tx.user.findUnique({ where: { id: userId } });
            const escrowRefund = order.quantity * order.pricePerUnit;

            await tx.user.update({
                where: { id: userId },
                data: { gold: user.gold + escrowRefund }
            });

            // 3. Update order status
            await tx.marketOrder.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });

            // 4. Log transaction
            await tx.transactionLedger.create({
                data: {
                    userId,
                    type: 'ORDER_CANCEL',
                    currencyTier: 'GOLD',
                    amountDelta: escrowRefund,
                    newBalance: user.gold + escrowRefund,
                    metadata: JSON.stringify({
                        orderId,
                        orderType: order.type,
                        itemTemplateId: order.itemTemplateId,
                        quantity: order.quantity,
                        pricePerUnit: order.pricePerUnit
                    })
                }
            });

            this.log(`User ${userId} cancelled order ${orderId}, refunded ${escrowRefund} gold`, "Market");

            return { success: true, refundedAmount: escrowRefund };
        });
    }
}

module.exports = new MarketService();
