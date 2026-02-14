const BaseService = require('../BaseService');
const marketValidator = require('./MarketValidator');
const transactionManager = require('../economy/TransactionManager');
const marketFee = require('../economy/MarketFeeComponent');
const priceResolver = require('../../logic/economy/CommodityPriceResolver');

/**
 * MarketListingService
 * Orchestrates the creation and management of market listings.
 * Enhanced with Guild-based regional taxation and Dynamic Commodity Pricing.
 */
class MarketListingService extends BaseService {
    constructor() {
        super();
        this.LISTING_EXPIRY_HOURS = 24;
    }

    /**
     * Resolves the dynamic regional base value for an item.
     */
    async _getRegionalBaseValue(tx, regionId, itemTemplate) {
        // Dynamic pricing only applies to Raw Materials
        if (itemTemplate.category !== "MATERIAL") return itemTemplate.baseValue;

        const stats = await tx.regionalExtractionStats.findUnique({
            where: { regionId_templateId: { regionId, templateId: itemTemplate.id } }
        });

        const volume = stats ? stats.volume24h : 0;
        const multiplier = priceResolver.resolveMultiplier(volume);
        
        return Math.floor(itemTemplate.baseValue * multiplier);
    }

    async listItem(userId, itemInstanceId, pricePerUnit) {
        if (!pricePerUnit || pricePerUnit < 1) throw new Error("Price must be at least 1 Gold.");
        
        const user = await marketValidator.verifyInTown(userId);
        
        const item = await this.db.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true, marketOrders: true, equippedIn: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found.");
        if (item.marketOrders.length > 0 || item.equippedIn) throw new Error("Item is locked.");

        // --- Bandit Stolen Goods Check ---
        if (item.isStolen) {
            throw new Error("Penyelundup! Barang curian tidak bisa didaftarkan di pasar resmi. Jual ke penadah di sarang penjahat.");
        }
        
        // --- AAA Guild Taxation Context ---
        const territory = await this.db.territory.findUnique({
            where: { regionId: user.currentRegion },
            include: { guild: true }
        });
        const guildTaxRate = territory ? territory.guild.marketTaxRate : 0;
        
        // AAA: Faction Discount Check
        const isFactionAlly = territory && user.factionId && user.factionId === territory.guild.factionId;

        // --- AAA Dynamic Commodity Pricing ---
        const dynamicBaseValue = await this._getRegionalBaseValue(this.db, user.currentRegion, item.template);
        const effectivePriceForFee = Math.max(pricePerUnit, dynamicBaseValue);

        const totalListingValue = effectivePriceForFee * item.quantity;
        const upfrontFee = marketFee.calculateListingFee(totalListingValue, guildTaxRate, isFactionAlly);
        const guildRevenue = marketFee.calculateGuildRevenue(totalListingValue, guildTaxRate, isFactionAlly);

        return await this.runTransaction(async (tx) => {
            // 1. Deduct Total Listing Fee from Player
            await transactionManager.removeCurrency(tx, userId, upfrontFee, "MARKET_LISTING_FEE", item.templateId, "ITEM");

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
