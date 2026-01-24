const marketRepository = require('../repositories/marketRepository');
const userRepository = require('../repositories/userRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const prisma = new (require('@prisma/client').PrismaClient)();
const math = require('mathjs');

class MarketService {
    /**
     * Standard Base System Tax: 5% (Always removed from game)
     */
    static BASE_TAX_RATE = 0.05;

    async buyItem(buyer, listingId) {
        const listing = await marketRepository.findListingById(listingId);
        if (!listing || listing.isSold) throw new Error("Listing unavailable.");
        if (buyer.gold < listing.totalPrice) throw new Error("Insufficient gold.");

        // 1. Fetch Region Territory Data
        const region = await prisma.regionTemplate.findUnique({
            where: { id: buyer.currentRegion }
        });

        // 2. AAA TAX LOGIC: Base Tax + Regional Guild Tax
        const totalPaid = listing.totalPrice;
        const baseTax = math.floor(math.multiply(totalPaid, MarketService.BASE_TAX_RATE));
        
        let regionalTax = 0;
        if (region.ownerGuildId) {
            regionalTax = math.floor(math.multiply(totalPaid, region.localTaxRate));
        }

        const totalTax = math.add(baseTax, regionalTax);
        const sellerRevenue = math.subtract(totalPaid, totalTax);

        // 3. ATOMIC TRANSACTIONS
        await userRepository.updateGold(buyer.id, math.subtract(buyer.gold, totalPaid));
        await userRepository.updateGold(listing.sellerId, math.add(listing.seller.gold, sellerRevenue));
        
        // --- GUILD REVENUE ---
        if (region.ownerGuildId && regionalTax > 0) {
            await prisma.guild.update({
                where: { id: region.ownerGuildId },
                data: { 
                    vaultGold: { increment: regionalTax },
                    taxIncomeTotal: { increment: regionalTax }
                }
            });
            console.log(`[GEOPOLITICS] Guild ${region.ownerGuildId} received ${regionalTax} Gold in tax from ${region.name}`);
        }

        // 4. Transfer Ownership
        await inventoryRepository.updateOwner(listing.itemInstanceId, buyer.id);
        await marketRepository.markAsSold(listing.id);

        // 5. Record History
        await marketRepository.addHistory({
            templateId: listing.templateId,
            quantity: listing.quantity,
            soldPrice: totalPaid,
            taxPaid: totalTax, // Recorded as total sink + guild pay
            buyerId: buyer.id,
            sellerId: listing.sellerId
        });

        return { success: true, guildTax: regionalTax, baseTax: baseTax };
    }
}

module.exports = new MarketService();
