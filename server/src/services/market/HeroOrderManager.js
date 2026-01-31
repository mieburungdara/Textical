const transactionManager = require('../economy/TransactionManager');

/**
 * AAA HeroOrderManager
 * Logic for listing heroes and creating buy requests.
 * Handles the "Locked" status of heroes in the market.
 */
class HeroOrderManager {
    /**
     * Lists a specific hero for sale.
     * Removes the hero from any active formation slots.
     */
    async createHeroSellOrder(tx, userId, regionId, heroId, price) {
        const hero = await tx.hero.findUnique({
            where: { id: heroId },
            include: { formationSlots: true }
        });

        if (!hero || hero.userId !== userId) throw new Error("Hero not found.");
        
        // 1. Remove from all formations before listing
        if (hero.formationSlots.length > 0) {
            await tx.formationSlot.deleteMany({ where: { heroId } });
        }

        // 2. Create the Order
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 72); // 72hr listing

        return await tx.heroOrder.create({
            data: {
                creatorId: userId,
                regionId,
                heroId,
                type: "SELL",
                price,
                expiresAt: expiry
            }
        });
    }

    /**
     * Creates a Buy Order for a hero meeting specific criteria.
     */
    async createHeroBuyOrder(tx, userId, regionId, targetClassId, minLevel, price) {
        // 1. Escrow Gold
        await transactionManager.removeGold(tx, userId, price, "HERO_MARKET_ESCROW", targetClassId, "HERO_BUY_ORDER");

        // 2. Create the Order
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 168); // 1 week for hero buy orders

        return await tx.heroOrder.create({
            data: {
                creatorId: userId,
                regionId,
                targetClassId,
                minUnitLevel: minLevel,
                type: "BUY",
                price,
                expiresAt: expiry
            }
        });
    }

    async cancelOrder(tx, userId, orderId) {
        const order = await tx.heroOrder.findUnique({
            where: { id: orderId }
        });

        if (!order || order.creatorId !== userId) throw new Error("Order not found.");
        if (order.status !== "OPEN") throw new Error("Only open orders can be cancelled.");

        // Refund escrow if BUY order
        if (order.type === "BUY") {
            await transactionManager.addGold(tx, userId, order.price, "HERO_MARKET_REFUND", orderId, "HERO_BUY_ORDER");
        }

        return await tx.heroOrder.update({
            where: { id: orderId },
            data: { status: "CANCELLED" }
        });
    }
}

module.exports = new HeroOrderManager();
