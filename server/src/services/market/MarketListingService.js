const BaseService = require('../BaseService');
const marketValidator = require('./MarketValidator');
const transactionManager = require('../economy/TransactionManager');
const marketFee = require('../economy/MarketFeeComponent');

/**
 * MarketListingService
 * Orchestrates the creation and management of market listings.
 * Refactored to use modular TransactionManager and MarketFee components.
 */
class MarketListingService extends BaseService {
    constructor() {
        super();
        this.LISTING_EXPIRY_HOURS = 24;
    }

    async listItem(userId, itemInstanceId, pricePerUnit) {
        if (!pricePerUnit || pricePerUnit < 1) throw new Error("Price must be at least 1 Gold.");
        
        await marketValidator.verifyInTown(userId);
        
        const item = await this.db.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true, marketListing: true, equippedIn: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found.");
        if (item.marketListing || item.equippedIn) throw new Error("Item is locked.");
        
        const totalListingValue = pricePerUnit * item.quantity;
        const upfrontFee = marketFee.calculateListingFee(totalListingValue);

        return await this.runTransaction(async (tx) => {
            // 1. Deduct Listing Fee
            await transactionManager.removeGold(tx, userId, upfrontFee, "MARKET_LISTING_FEE", item.templateId, "ITEM");

            // 2. Create Listing
            const listing = await tx.marketListing.create({
                data: {
                    sellerId: userId,
                    templateId: item.templateId,
                    itemInstanceId: item.id,
                    pricePerUnit: pricePerUnit,
                    expiresAt: new Date(Date.now() + (this.LISTING_EXPIRY_HOURS * 60 * 60 * 1000))
                }
            });

            this.log(`Listing created: User ${userId} listed ${item.templateId} for ${pricePerUnit}`, "Market");
            return listing;
        });
    }

    async getActiveListings(userId) {
        return await this.db.marketListing.findMany({
            where: { expiresAt: { gt: new Date() } },
            include: { itemTemplate: true, itemInstance: true }
        });
    }

    async archiveExpiredListings() {
        const expired = await this.db.marketListing.findMany({
            where: { expiresAt: { lte: new Date() } }
        });

        for (const listing of expired) {
            await this.db.marketListing.delete({ where: { id: listing.id } });
            this.log(`Archived expired listing ID: ${listing.id}`, "Market");
        }
    }
}

module.exports = new MarketListingService();