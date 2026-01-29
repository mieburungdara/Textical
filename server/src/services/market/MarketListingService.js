const BaseService = require('../BaseService');
const marketValidator = require('./MarketValidator');

class MarketListingService extends BaseService {
    constructor() {
        super();
        this.UPFRONT_TAX_RATE = 0.05; // 5% Listing Fee
        this.LISTING_EXPIRY_HOURS = 24;
    }

    async listItem(userId, itemInstanceId, pricePerUnit) {
        if (!pricePerUnit || pricePerUnit < 1) throw new Error("Price must be at least 1 Gold.");
        const user = await marketValidator.verifyInTown(userId);
        
        const item = await this.db.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true, marketListing: true, equippedIn: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found in your inventory.");
        if (item.marketListing) throw new Error("Item is already listed on the market.");
        if (item.equippedIn) throw new Error("Cannot list an item that is currently equipped.");
        
        const totalListingValue = pricePerUnit * item.quantity;
        const upfrontTax = Math.ceil(totalListingValue * this.UPFRONT_TAX_RATE);

        if (user.gold < upfrontTax) {
            throw new Error(`Insufficient Gold for listing tax. Need ${upfrontTax} Gold (5% of ${totalListingValue}).`);
        }

        // Transaction: Deduct Tax -> Create Listing
        return await this.db.$transaction([
            this.db.user.update({
                where: { id: userId },
                data: { gold: user.gold - upfrontTax }
            }),
            this.db.transactionLedger.create({
                data: {
                    userId,
                    type: "MARKET_LISTING_TAX",
                    currencyTier: "GOLD",
                    amountDelta: -upfrontTax,
                    newBalance: user.gold - upfrontTax,
                    metadata: JSON.stringify({ itemTemplateId: item.templateId, qty: item.quantity })
                }
            }),
            this.db.marketListing.create({
                data: {
                    sellerId: userId,
                    templateId: item.templateId,
                    itemInstanceId: item.id,
                    pricePerUnit: pricePerUnit,
                    expiresAt: new Date(Date.now() + (this.LISTING_EXPIRY_HOURS * 60 * 60 * 1000))
                }
            })
        ]);
    }

    async getActiveListings(userId) {
        await marketValidator.verifyInTown(userId);
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
            console.log(`[MARKET] Archived expired listing ID: ${listing.id}`);
        }
    }
}

module.exports = new MarketListingService();
