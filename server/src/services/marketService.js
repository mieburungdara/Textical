const marketListingService = require('./market/MarketListingService');
const marketTransactionService = require('./market/MarketTransactionService');

/**
 * MarketService (v2.0 - Modular Orchestrator)
 * Delegates market operations to specialized sub-services.
 */
class MarketService {
    async listItem(userId, itemInstanceId, pricePerUnit) {
        return await marketListingService.listItem(userId, itemInstanceId, pricePerUnit);
    }

    async purchaseItem(buyerId, listingId) {
        return await marketTransactionService.purchaseItem(buyerId, listingId);
    }

    async npcSell(userId, itemInstanceId) {
        return await marketTransactionService.npcSell(userId, itemInstanceId);
    }

    async getActiveListings(userId) {
        return await marketListingService.getActiveListings(userId);
    }

    async archiveExpiredListings() {
        return await marketListingService.archiveExpiredListings();
    }
}

module.exports = new MarketService();
