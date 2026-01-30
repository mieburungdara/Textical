const transactionManager = require('../economy/TransactionManager');
const marketFee = require('../economy/MarketFeeComponent');

/**
 * AAA OrderMatcher
 * The heart of the "Stock Market" system. Matches demand with supply.
 */
class OrderMatcher {
    /**
     * Matches a new Buy Order against existing Sell Orders in the region.
     */
    async matchBuyOrder(tx, buyOrder) {
        // 1. Find cheapest SELL orders for this item in this region
        const sellOrders = await tx.marketOrder.findMany({
            where: {
                regionId: buyOrder.regionId,
                templateId: buyOrder.templateId,
                type: "SELL",
                status: "OPEN",
                pricePerUnit: { lte: buyOrder.pricePerUnit }
            },
            orderBy: { pricePerUnit: 'asc' }, // Cheapest first
            include: { creator: true, itemInstance: true }
        });

        for (const sell of sellOrders) {
            if (buyOrder.remainingQuantity <= 0) break;

            const fulfillQty = Math.min(buyOrder.remainingQuantity, sell.remainingQuantity);
            const totalPrice = fulfillQty * sell.pricePerUnit;
            const sellerNet = marketFee.calculateSellerNet(totalPrice);

            // a. Update Seller (Add Gold)
            await transactionManager.addGold(tx, sell.creatorId, sellerNet, "MARKET_ORDER_FILL", sell.id, "ORDER");

            // b. Transfer Items to Buyer (Atomic Add)
            await tx.inventoryItem.upsert({
                where: { userId_templateId: { userId: buyOrder.creatorId, templateId: buyOrder.templateId } },
                update: { quantity: { increment: fulfillQty } },
                create: { userId: buyOrder.creatorId, templateId: buyOrder.templateId, quantity: fulfillQty }
            });

            // c. Update Quantities
            buyOrder.remainingQuantity -= fulfillQty;
            sell.remainingQuantity -= fulfillQty;

            await tx.marketOrder.update({
                where: { id: sell.id },
                data: { 
                    remainingQuantity: sell.remainingQuantity,
                    status: sell.remainingQuantity === 0 ? "FILLED" : "OPEN"
                }
            });

            // d. Deduct from seller's locked instance
            if (sell.itemInstanceId) {
                if (sell.itemInstance.quantity === fulfillQty) {
                    await tx.inventoryItem.delete({ where: { id: sell.itemInstanceId } });
                } else {
                    await tx.inventoryItem.update({
                        where: { id: sell.itemInstanceId },
                        data: { quantity: { decrement: fulfillQty } }
                    });
                }
            }
        }

        // 2. Finalize Buy Order Status
        await tx.marketOrder.update({
            where: { id: buyOrder.id },
            data: { 
                remainingQuantity: buyOrder.remainingQuantity,
                status: buyOrder.remainingQuantity === 0 ? "FILLED" : "OPEN"
            }
        });
    }

    /**
     * Matches a new Sell Order against existing Buy Orders.
     * (Seller wants to sell instantly to highest bidders).
     */
    async matchSellOrder(tx, sellOrder) {
        const buyOrders = await tx.marketOrder.findMany({
            where: {
                regionId: sellOrder.regionId,
                templateId: sellOrder.templateId,
                type: "BUY",
                status: "OPEN",
                pricePerUnit: { gte: sellOrder.pricePerUnit }
            },
            orderBy: { pricePerUnit: 'desc' }, // Highest first
            include: { creator: true }
        });

        for (const buy of buyOrders) {
            if (sellOrder.remainingQuantity <= 0) break;

            const fulfillQty = Math.min(sellOrder.remainingQuantity, buy.remainingQuantity);
            const totalPrice = fulfillQty * buy.pricePerUnit;
            const sellerNet = marketFee.calculateSellerNet(totalPrice);

            // a. Seller gets Gold
            await transactionManager.addGold(tx, sellOrder.creatorId, sellerNet, "MARKET_ORDER_FILL", sellOrder.id, "ORDER");

            // b. Buyer gets Items
            await tx.inventoryItem.upsert({
                where: { userId_templateId: { userId: buy.creatorId, templateId: buy.templateId } },
                update: { quantity: { increment: fulfillQty } },
                create: { userId: buy.creatorId, templateId: buy.templateId, quantity: fulfillQty }
            });

            // c. Update Quantities
            sellOrder.remainingQuantity -= fulfillQty;
            buy.remainingQuantity -= fulfillQty;

            await tx.marketOrder.update({
                where: { id: buy.id },
                data: { 
                    remainingQuantity: buy.remainingQuantity,
                    status: buy.remainingQuantity === 0 ? "FILLED" : "OPEN"
                }
            });
        }

        await tx.marketOrder.update({
            where: { id: sellOrder.id },
            data: { 
                remainingQuantity: sellOrder.remainingQuantity,
                status: sellOrder.remainingQuantity === 0 ? "FILLED" : "OPEN"
            }
        });
    }
}

module.exports = new OrderMatcher();
