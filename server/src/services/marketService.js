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
     */
    async purchaseItem(userId, listingId) {
        // TODO: Implement purchase logic
    }

    /**
     * Sell item to NPC.
     */
    async npcSell(userId, itemId) {
        // TODO: Implement NPC sell logic
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

    async cancelOrder(userId, orderId) {
        // Implement cancellation logic (refunding escrow or unlocking items)
    }
}

module.exports = new MarketService();
