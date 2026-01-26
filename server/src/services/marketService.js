const prisma = require('../db');


/**
 * MarketService
 * Handles Player-to-Player trades and NPC Liquidation.
 * Enforces Town-Only rules and the Dual-Tax system (5% + 5%).
 */
class MarketService {
    constructor() {
        this.UPFRONT_TAX_RATE = 0.05; // 5% Listing Fee
        this.SALES_TAX_RATE = 0.05;   // 5% Transaction Fee
        this.NPC_BUY_RATE = 0.10;     // 90% Penalty vs BaseValue
        this.LISTING_EXPIRY_HOURS = 24;
    }

    /**
     * Checks if a user is currently in a Town.
     */
    async _verifyInTown(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { taskQueue: true }
        });
        
        // Find current region template
        const region = await prisma.regionTemplate.findUnique({
            where: { id: user.currentRegion }
        });

        if (!region || region.type !== "TOWN") {
            throw new Error(`Market actions are forbidden in ${region ? region.name : 'the wilderness'}. Return to a Town.`);
        }
        return user;
    }

    /**
     * List an item on the market.
     * Deducts 5% tax upfront.
     */
    async listItem(userId, itemInstanceId, pricePerUnit) {
        const user = await this._verifyInTown(userId);
        
        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found in your inventory.");
        
        const totalListingValue = pricePerUnit * item.quantity;
        const upfrontTax = Math.ceil(totalListingValue * this.UPFRONT_TAX_RATE);

        if (user.gold < upfrontTax) {
            throw new Error(`Insufficient Gold for listing tax. Need ${upfrontTax} Gold (5% of ${totalListingValue}).`);
        }

        // Transaction: Deduct Tax -> Create Listing
        return await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { gold: user.gold - upfrontTax }
            }),
            prisma.transactionLedger.create({
                data: {
                    userId,
                    type: "MARKET_LISTING_TAX",
                    currencyTier: "GOLD",
                    amountDelta: -upfrontTax,
                    newBalance: user.gold - upfrontTax,
                    metadata: JSON.stringify({ itemTemplateId: item.templateId, qty: item.quantity })
                }
            }),
            prisma.marketListing.create({
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

    /**
     * Purchase an item from the market.
     * Deducts 5% tax from the seller's profit.
     */
    async purchaseItem(buyerId, listingId) {
        await this._verifyInTown(buyerId);

        const listing = await prisma.marketListing.findUnique({
            where: { id: listingId },
            include: { itemInstance: true, seller: true }
        });

        if (!listing) throw new Error("Listing not found or expired.");
        if (listing.sellerId === buyerId) throw new Error("You cannot buy your own item.");

        const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
        const totalPrice = listing.pricePerUnit * listing.itemInstance.quantity;

        if (buyer.gold < totalPrice) throw new Error("Insufficient Gold for purchase.");

        const salesTax = Math.floor(totalPrice * this.SALES_TAX_RATE);
        const sellerNetProfit = totalPrice - salesTax;

        // Atomic Swap
        return await prisma.$transaction([
            // 1. Buyer Pays
            prisma.user.update({ where: { id: buyerId }, data: { gold: buyer.gold - totalPrice } }),
            // 2. Seller Receives (Net)
            prisma.user.update({ where: { id: listing.sellerId }, data: { gold: listing.seller.gold + sellerNetProfit } }),
            // 3. Ownership Transfer
            prisma.inventoryItem.update({ where: { id: listing.itemInstanceId }, data: { userId: buyerId } }),
            // 4. Delete Listing
            prisma.marketListing.delete({ where: { id: listingId } }),
            // 5. Log Transaction
            prisma.transactionLedger.create({
                data: {
                    userId: listing.sellerId,
                    type: "MARKET_SALE",
                    currencyTier: "GOLD",
                    amountDelta: sellerNetProfit,
                    newBalance: listing.seller.gold + sellerNetProfit,
                    metadata: JSON.stringify({ taxBurned: salesTax, buyerId })
                }
            })
        ]);
    }

    /**
     * Sell item to NPC (Emergency Liquidity).
     * 90% cheaper than base value.
     */
    async npcSell(userId, itemInstanceId) {
        await this._verifyInTown(userId);

        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found.");

        const npcPricePerUnit = Math.floor(item.template.baseValue * this.NPC_BUY_RATE);
        const totalPayout = npcPricePerUnit * item.quantity;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        return await prisma.$transaction([
            prisma.user.update({ where: { id: userId }, data: { gold: user.gold + totalPayout } }),
            prisma.inventoryItem.delete({ where: { id: itemInstanceId } }),
            prisma.transactionLedger.create({
                data: {
                    userId,
                    type: "NPC_SELL",
                    currencyTier: "GOLD",
                    amountDelta: totalPayout,
                    newBalance: user.gold + totalPayout,
                    metadata: JSON.stringify({ templateId: item.templateId, qty: item.quantity })
                }
            })
        ]);
    }

    /**
     * Browse market (Town-Only).
     */
    async getActiveListings(userId) {
        await this._verifyInTown(userId);
        return await prisma.marketListing.findMany({
            where: { expiresAt: { gt: new Date() } },
            include: { itemTemplate: true, itemInstance: true }
        });
    }

    /**
     * Background task to archive expired listings.
     */
    async archiveExpiredListings() {
        const expired = await prisma.marketListing.findMany({
            where: { expiresAt: { lte: new Date() } }
        });

        for (const listing of expired) {
            // Simply delete the listing; item remains in seller's inventory model 
            // (but is no longer "locked" by a listing reference)
            await prisma.marketListing.delete({ where: { id: listing.id } });
            console.log(`[MARKET] Archived expired listing ID: ${listing.id}`);
        }
    }
}

module.exports = new MarketService();