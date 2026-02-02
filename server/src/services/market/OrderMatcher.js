const transactionManager = require('../economy/TransactionManager');
const marketFee = require('../economy/MarketFeeComponent');
const inventoryManager = require('../inventory/InventoryManager');

/**
 * AAA OrderMatcher
 * Enhanced to support Faction-based tax discounts in territory.
 */
class OrderMatcher {
    /**
     * Helper to get guild and faction context for a region.
     */
    async _getRegionContext(tx, regionId) {
        const region = await tx.regionTemplate.findUnique({
            where: { id: regionId },
            include: { territory: { include: { guild: true } } }
        });
        return {
            guild: region.territory ? region.territory.guild : null,
            regionalTaxRate: region.regionalTaxRate
        };
    }

    async matchBuyOrder(tx, buyOrder) {
        const { guild, regionalTaxRate } = await this._getRegionContext(tx, buyOrder.regionId);
        const guildTaxRate = guild ? guild.marketTaxRate : 0;
        
        // Faction Context: Buyer faction
        const buyer = await tx.user.findUnique({ where: { id: buyOrder.creatorId } });

        const sellOrders = await tx.marketOrder.findMany({
            where: {
                regionId: buyOrder.regionId,
                templateId: buyOrder.templateId,
                type: "SELL",
                status: "OPEN",
                pricePerUnit: { lte: buyOrder.pricePerUnit }
            },
            orderBy: { pricePerUnit: 'asc' },
            include: { creator: true, itemInstance: true }
        });

        for (const sell of sellOrders) {
            if (buyOrder.remainingQuantity <= 0) break;

            const fulfillQty = Math.min(buyOrder.remainingQuantity, sell.remainingQuantity);
            const totalPrice = fulfillQty * sell.pricePerUnit;
            
            // AAA: Faction Discount - Check if SELLER is ally of owning guild
            const isFactionAlly = guild && sell.creator.factionId && sell.creator.factionId === guild.factionId;

            // AAA: Volume Incentive Context
            const sellerVolume = await tx.itemSaleHistory.count({ where: { sellerId: sell.creatorId } });

            const sellerNet = marketFee.calculateSellerNet(totalPrice, guildTaxRate, isFactionAlly, regionalTaxRate, sellerVolume);
            const guildRevenue = marketFee.calculateGuildRevenue(totalPrice, guildTaxRate, isFactionAlly);

            // a. Update Seller
            await transactionManager.addCurrency(tx, sell.creatorId, sellerNet, "MARKET_ORDER_FILL", sell.id, "ORDER");

            // b. Update Guild
            if (guild && guildRevenue > 0) {
                await tx.guild.update({
                    where: { id: guild.id },
                    data: { treasury: { increment: guildRevenue } }
                });
            }

            // c. Transfer Items to Buyer
            const itemOps = await inventoryManager.resolveStackingOps(tx, buyOrder.creatorId, buyOrder.templateId, fulfillQty);
            await Promise.all(itemOps);

            // AAA: Log Sale History for Analytics & Incentives
            await tx.itemSaleHistory.create({
                data: {
                    sellerId: sell.creatorId,
                    templateId: buyOrder.templateId,
                    pricePerUnit: sell.pricePerUnit,
                    quantity: fulfillQty,
                    regionId: buyOrder.regionId
                }
            });

            // d. Update Quantities
            buyOrder.remainingQuantity -= fulfillQty;
            sell.remainingQuantity -= fulfillQty;

            await tx.marketOrder.update({
                where: { id: sell.id },
                data: { 
                    remainingQuantity: sell.remainingQuantity,
                    status: sell.remainingQuantity === 0 ? "FILLED" : "OPEN"
                }
            });

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

        await tx.marketOrder.update({
            where: { id: buyOrder.id },
            data: { 
                remainingQuantity: buyOrder.remainingQuantity,
                status: buyOrder.remainingQuantity === 0 ? "FILLED" : "OPEN"
            }
        });
    }

    async matchSellOrder(tx, sellOrder) {
        const { guild, regionalTaxRate } = await this._getRegionContext(tx, sellOrder.regionId);
        const guildTaxRate = guild ? guild.marketTaxRate : 0;
        
        const seller = await tx.user.findUnique({ where: { id: sellOrder.creatorId } });
        const isFactionAlly = guild && seller.factionId && seller.factionId === guild.factionId;

        const buyOrders = await tx.marketOrder.findMany({
            where: {
                regionId: sellOrder.regionId,
                templateId: sellOrder.templateId,
                type: "BUY",
                status: "OPEN",
                pricePerUnit: { gte: sellOrder.pricePerUnit }
            },
            orderBy: { pricePerUnit: 'desc' },
            include: { creator: true }
        });

        for (const buy of buyOrders) {
            if (sellOrder.remainingQuantity <= 0) break;

            const fulfillQty = Math.min(sellOrder.remainingQuantity, buy.remainingQuantity);
            const totalPrice = fulfillQty * buy.pricePerUnit;
            
            // AAA: Volume Incentive Context
            const sellerVolume = await tx.itemSaleHistory.count({ where: { sellerId: sellOrder.creatorId } });

            const sellerNet = marketFee.calculateSellerNet(totalPrice, guildTaxRate, isFactionAlly, regionalTaxRate, sellerVolume);
            const guildRevenue = marketFee.calculateGuildRevenue(totalPrice, guildTaxRate, isFactionAlly);

            // a. Seller gets Gold
            await transactionManager.addCurrency(tx, sellOrder.creatorId, sellerNet, "MARKET_ORDER_FILL", sellOrder.id, "ORDER");

            // b. Guild gets Revenue
            if (guild && guildRevenue > 0) {
                await tx.guild.update({
                    where: { id: guild.id },
                    data: { treasury: { increment: guildRevenue } }
                });
            }

            // c. Buyer gets Items
            const itemOps = await inventoryManager.resolveStackingOps(tx, buy.creatorId, sellOrder.templateId, fulfillQty);
            await Promise.all(itemOps);

            // AAA: Log Sale History for Analytics
            await tx.itemSaleHistory.create({
                data: {
                    sellerId: sellOrder.creatorId,
                    templateId: sellOrder.templateId,
                    pricePerUnit: buy.pricePerUnit,
                    quantity: fulfillQty,
                    regionId: sellOrder.regionId
                }
            });

            // d. Update Quantities
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
