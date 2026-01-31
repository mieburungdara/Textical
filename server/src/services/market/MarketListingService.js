const BaseService = require('../BaseService');
const marketValidator = require('./MarketValidator');
const transactionManager = require('../economy/TransactionManager');
const marketFee = require('../economy/MarketFeeComponent');

/**
 * MarketListingService
 * Orchestrates the creation and management of market listings.
 * Enhanced to support Guild-based regional taxation.
 */
class MarketListingService extends BaseService {
    constructor() {
        super();
        this.LISTING_EXPIRY_HOURS = 24;
    }

    async listItem(userId, itemInstanceId, pricePerUnit) {
        if (!pricePerUnit || pricePerUnit < 1) throw new Error("Price must be at least 1 Gold.");
        
        const user = await marketValidator.verifyInTown(userId);
        
        const item = await this.db.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true, marketOrders: true, equippedIn: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found.");
        // Note: renamed from marketListing to marketOrders in previous refactor
        if (item.marketOrders.length > 0 || item.equippedIn) throw new Error("Item is locked.");
        
        // --- AAA Guild Taxation Context ---
        const territory = await this.db.territory.findUnique({
            where: { regionId: user.currentRegion },
            include: { guild: true }
        });
        const guildTaxRate = territory ? territory.guild.marketTaxRate : 0;

        const totalListingValue = pricePerUnit * item.quantity;
        const upfrontFee = marketFee.calculateListingFee(totalListingValue, guildTaxRate);
        const guildRevenue = marketFee.calculateGuildRevenue(totalListingValue, guildTaxRate);

        return await this.runTransaction(async (tx) => {
            // 1. Deduct Total Listing Fee from Player
            await transactionManager.removeGold(tx, userId, upfrontFee, "MARKET_LISTING_FEE", item.templateId, "ITEM");

            // 2. Credit Guild Revenue (if applicable)
            if (territory && guildRevenue > 0) {
                await tx.guild.update({
                    where: { id: territory.guildId },
                    data: { treasury: { increment: guildRevenue } }
                });
            }

            // 3. Create Order (Using MarketOrder model now)
            const expiry = new Date();
            expiry.setHours(expiry.getHours() + this.LISTING_EXPIRY_HOURS);

            const order = await tx.marketOrder.create({
                data: {
                    creatorId: userId,
                    regionId: user.currentRegion,
                    templateId: item.templateId,
                    itemInstanceId: item.id,
                    type: "SELL",
                    pricePerUnit: pricePerUnit,
                    initialQuantity: item.quantity,
                    remainingQuantity: item.quantity,
                    expiresAt: expiry
                }
            });

            this.log(`Sell Order created: User ${userId} listed ${item.templateId} for ${pricePerUnit} in Region ${user.currentRegion}`, "Market");
            return order;
        });
    }

    async getActiveListings(userId) {
        return await this.db.marketOrder.findMany({
            where: { status: "OPEN", expiresAt: { gt: new Date() } },
            include: { itemTemplate: true, itemInstance: true }
        });
    }

    async archiveExpiredListings() {
        const expired = await this.db.marketOrder.findMany({
            where: { expiresAt: { lte: new Date() }, status: "OPEN" }
        });

        for (const order of expired) {
            await this.db.marketOrder.update({ 
                where: { id: order.id },
                data: { status: "EXPIRED" }
            });
            this.log(`Archived expired order ID: ${order.id}`, "Market");
        }
    }
}

module.exports = new MarketListingService();
