const BaseService = require('./BaseService');
const marketValidator = require('./market/MarketValidator');
const orderManager = require('./market/MarketOrderManager');
const orderMatcher = require('./market/OrderMatcher');

/**
 * MarketService
 * Thin orchestrator for Albion-Style Localized Orders.
 * Refactored to handle dynamic Buy/Sell orders and immediate matching.
 */
class MarketService extends BaseService {
    /**
     * Create a Sell Order and attempt immediate matching.
     */
    async createSellOrder(userId, itemInstanceId, quantity, pricePerUnit) {
        const user = await marketValidator.verifyInTown(userId);
        
        return await this.runTransaction(async (tx) => {
            const order = await orderManager.createSellOrder(tx, userId, user.currentRegion, itemInstanceId, quantity, pricePerUnit);
            await orderMatcher.matchSellOrder(tx, order);
            
            this.log(`Sell Order created: User ${userId} listed ${quantity} units at ${pricePerUnit} in Region ${user.currentRegion}`, "Market");
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