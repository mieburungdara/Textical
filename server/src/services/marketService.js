const marketRepository = require('../repositories/marketRepository');
const userRepository = require('../repositories/userRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const math = require('mathjs');

class MarketService {
    /**
     * Standard Market Tax: 5% (0.05)
     */
    static TAX_RATE = 0.05;

    async listItem(user, itemId, pricePerUnit, quantity) {
        const item = await inventoryRepository.findItemById(itemId, user.id);
        if (!item) throw new Error("Item not found.");
        if (item.isEquipped) throw new Error("Unequip the item first.");
        
        return await marketRepository.createListing({
            sellerId: user.id,
            templateId: item.templateId,
            itemInstanceId: item.id,
            quantity: quantity,
            pricePerUnit: pricePerUnit
        });
    }

    async buyItem(buyer, listingId) {
        const listing = await marketRepository.findListingById(listingId);
        if (!listing || listing.isSold || listing.expiresAt < new Date()) {
            throw new Error("Listing unavailable.");
        }

        if (buyer.id === listing.sellerId) throw new Error("Cannot buy own item.");
        if (buyer.gold < listing.totalPrice) throw new Error("Insufficient gold.");

        // --- TAX CALCULATION (The Sink) ---
        const totalPaid = listing.totalPrice;
        const taxAmount = math.floor(math.multiply(totalPaid, MarketService.TAX_RATE));
        const sellerRevenue = math.subtract(totalPaid, taxAmount);

        // --- ATOMIC-LIKE TRANSACTION ---
        
        // 1. Deduct full price from Buyer
        await userRepository.updateGold(buyer.id, math.subtract(buyer.gold, totalPaid));

        // 2. Add revenue (Price - Tax) to Seller
        const seller = listing.seller;
        await userRepository.updateGold(seller.id, math.add(seller.gold, sellerRevenue));

        // 3. Transfer Item
        // Note: Repository needs transferOwnership method
        await inventoryRepository.updateOwner(listing.itemInstanceId, buyer.id);

        // 4. Close Listing
        await marketRepository.markAsSold(listing.id);

        // 5. Record History with Tax Info
        await marketRepository.addHistory({
            templateId: listing.templateId,
            quantity: listing.quantity,
            soldPrice: totalPaid,
            taxPaid: taxAmount,
            buyerId: buyer.id,
            sellerId: seller.id
        });

        console.log(`[ECONOMY] Transaction Complete. Price: ${totalPaid}, Tax Sink: ${taxAmount}, Seller Recv: ${sellerRevenue}`);
        
        return { success: true, taxPaid: taxAmount };
    }
}

module.exports = new MarketService();