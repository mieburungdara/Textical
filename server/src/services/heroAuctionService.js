const BaseService = require('./BaseService');
const marketValidator = require('./market/MarketValidator');
const orderManager = require('./market/HeroOrderManager');
const transactionManager = require('./economy/TransactionManager');
const marketFee = require('./economy/MarketFeeComponent');
const analytics = require('../logic/market/MarketAnalytics');

/**
 * HeroAuctionService
 * Orchestrates the localized marketplace for Heroes and Expertise.
 * Enhanced with Market History and Analytics.
 */
class HeroAuctionService extends BaseService {
    /**
     * Lists a hero for sale in the current town.
     */
    async listHero(userId, heroId, price) {
        const user = await marketValidator.verifyInTown(userId);
        return await this.runTransaction(async (tx) => {
            const order = await orderManager.createHeroSellOrder(tx, userId, user.currentRegion, heroId, price);
            this.log(`Hero listed: User ${userId} listed Hero ${heroId} for ${price} in Region ${user.currentRegion}`, "Market");
            return order;
        });
    }

    /**
     * Creates a request to buy any hero meeting criteria.
     */
    async createBuyOrder(userId, targetClassId, minLevel, price) {
        const user = await marketValidator.verifyInTown(userId);
        return await this.runTransaction(async (tx) => {
            const order = await orderManager.createHeroBuyOrder(tx, userId, user.currentRegion, targetClassId, minLevel, price);
            this.log(`Hero Buy Order created: User ${userId} requested Class ${targetClassId} at ${price}`, "Market");
            return order;
        });
    }

    /**
     * Instantly purchase a specific listed hero.
     */
    async purchaseHero(buyerId, orderId) {
        const user = await marketValidator.verifyInTown(buyerId);

        return await this.runTransaction(async (tx) => {
            const order = await tx.heroOrder.findUnique({
                where: { id: orderId },
                include: { hero: true }
            });

            if (!order || order.type !== "SELL" || order.status !== "OPEN") throw new Error("Hero listing not found.");
            if (order.creatorId === buyerId) throw new Error("You cannot buy your own hero.");

            const totalPrice = order.price;
            const sellerNet = marketFee.calculateSellerNet(totalPrice);

            // 1. Financial Settlement
            await transactionManager.removeGold(tx, buyerId, totalPrice, "HERO_MARKET_BUY", orderId, "HERO_ORDER");
            await transactionManager.addGold(tx, order.creatorId, sellerNet, "HERO_MARKET_SALE", orderId, "HERO_ORDER");

            // 2. Transfer Ownership
            await tx.hero.update({
                where: { id: order.heroId },
                data: { userId: buyerId }
            });

            // 3. Record Sale History (AAA Analytics)
            await tx.heroSaleHistory.create({
                data: {
                    classId: order.hero.classId,
                    unitLevel: order.hero.unitLevel,
                    price: order.price,
                    regionId: order.regionId
                }
            });

            // 4. Close Order
            await tx.heroOrder.update({
                where: { id: orderId },
                data: { status: "FILLED" }
            });

            this.log(`Hero Purchased: User ${buyerId} bought Hero ${order.heroId} from ${order.creatorId}`, "Market");
            return { success: true };
        });
    }

    /**
     * Returns market analytics for a specific hero class in a region.
     */
    async getClassMarketAnalytics(classId, regionId = null) {
        const where = { classId };
        if (regionId) where.regionId = regionId;

        const history = await this.db.heroSaleHistory.findMany({
            where,
            orderBy: { soldAt: 'desc' },
            take: 20
        });

        return analytics.calculateAverages(history);
    }

    async getRegionalHeroOrders(userId, type = "SELL") {
        const user = await this.db.user.findUnique({ where: { id: userId } });
        return await this.db.heroOrder.findMany({
            where: { 
                regionId: user.currentRegion, 
                type,
                status: "OPEN",
                expiresAt: { gt: new Date() }
            },
            include: { hero: { include: { combatClass: true } }, targetClass: true, creator: true }
        });
    }
}

module.exports = new HeroAuctionService();
