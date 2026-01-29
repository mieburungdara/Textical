const BaseService = require('../BaseService');
const marketValidator = require('./MarketValidator');

class MarketTransactionService extends BaseService {
    constructor() {
        super();
        this.SALES_TAX_RATE = 0.05;   // 5% Transaction Fee
        this.NPC_BUY_RATE = 0.10;     // 90% Penalty vs BaseValue
    }

    async purchaseItem(buyerId, listingId) {
        await marketValidator.verifyInTown(buyerId);

        const listing = await this.db.marketListing.findUnique({
            where: { id: listingId },
            include: { itemInstance: true, seller: true }
        });

        if (!listing) throw new Error("Listing not found or expired.");
        if (listing.sellerId === buyerId) throw new Error("You cannot buy your own item.");

        const buyer = await this.db.user.findUnique({ where: { id: buyerId } });
        const totalPrice = listing.pricePerUnit * listing.itemInstance.quantity;

        if (buyer.gold < totalPrice) throw new Error("Insufficient Gold for purchase.");

        const salesTax = Math.floor(totalPrice * this.SALES_TAX_RATE);
        const sellerNetProfit = totalPrice - salesTax;

        // Ownership Transfer (Smart Merge)
        const existingItem = await this.db.inventoryItem.findUnique({
            where: { userId_templateId: { userId: buyerId, templateId: listing.templateId } }
        });

        const itemOps = [];
        if (existingItem) {
            itemOps.push(this.db.inventoryItem.update({
                where: { id: existingItem.id },
                data: { quantity: { increment: listing.itemInstance.quantity } }
            }));
            itemOps.push(this.db.inventoryItem.delete({
                where: { id: listing.itemInstanceId }
            }));
        } else {
            itemOps.push(this.db.inventoryItem.update({
                where: { id: listing.itemInstanceId },
                data: { userId: buyerId }
            }));
        }

        return await this.db.$transaction([
            this.db.user.update({ where: { id: buyerId }, data: { gold: buyer.gold - totalPrice } }),
            this.db.user.update({ where: { id: listing.sellerId }, data: { gold: listing.seller.gold + sellerNetProfit } }),
            ...itemOps,
            this.db.marketListing.delete({ where: { id: listingId } }),
            this.db.transactionLedger.create({
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

    async npcSell(userId, itemInstanceId) {
        await marketValidator.verifyInTown(userId);

        const item = await this.db.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true, marketListing: true, equippedIn: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found.");
        if (item.marketListing) throw new Error("Cannot sell an item that is currently listed on the market.");
        if (item.equippedIn) throw new Error("Cannot sell an item that is currently equipped.");

        const npcPricePerUnit = Math.floor(item.template.baseValue * this.NPC_BUY_RATE);
        const totalPayout = npcPricePerUnit * item.quantity;

        const user = await this.db.user.findUnique({ where: { id: userId } });

        return await this.db.$transaction([
            this.db.user.update({ where: { id: userId }, data: { gold: user.gold + totalPayout } }),
            this.db.inventoryItem.delete({ where: { id: itemInstanceId } }),
            this.db.transactionLedger.create({
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
}

module.exports = new MarketTransactionService();
