const BaseService = require('./BaseService');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../constants/ErrorCodes');

/**
 * TavernRumorService
 * Handles buying and selling of player-generated intelligence.
 */
class TavernRumorService extends BaseService {
    constructor() {
        super();
    }

    /**
     * Post a rumor for sale
     * @param {number} userId - Seller ID
     * @param {number} regionId - Region where post is made
     * @param {string} content - The intel (coordinates, monster tips)
     * @param {number} price - Silver cost to read
     */
    async postRumor(userId, regionId, content, price = 100) {
        if (!content || content.length < 10) {
            throw new Error("Rumor content is too short (min 10 chars).");
        }

        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { informantReputation: true, currentRegion: true }
            });

            if (!user.currentRegion?.hasInn) {
                throw new Error("Rumors can only be posted inside an Inn.");
            }

            return await tx.tavernRumor.create({
                data: {
                    sellerId: userId,
                    regionId,
                    content,
                    price,
                    reliabilityAt: user.informantReputation
                }
            });
        });
    }

    /**
     * Buy a rumor to reveal its content
     */
    async purchaseRumor(userId, rumorId) {
        return await this.runTransaction(async (tx) => {
            const rumor = await tx.tavernRumor.findUnique({
                where: { id: rumorId },
                include: { seller: true }
            });

            if (!rumor) throw new Error("Rumor not found.");

            // Check if already purchased
            const existing = await tx.tavernRumorPurchase.findFirst({
                where: { rumorId, buyerId: userId }
            });
            if (existing) return { rumor, message: "Already purchased." };

            const buyer = await tx.user.findUnique({ where: { id: userId } });
            if (buyer.silver < rumor.price) throw new Error("Insufficient Silver.");

            // 1. Deduct Silver from buyer
            await tx.user.update({
                where: { id: userId },
                data: { silver: { decrement: rumor.price } }
            });

            // 2. Give cut to seller (e.g., 80%)
            const sellerCut = Math.floor(rumor.price * 0.8);
            await tx.user.update({
                where: { id: rumor.sellerId },
                data: { silver: { increment: sellerCut } }
            });

            // 3. Record purchase
            await tx.tavernRumorPurchase.create({
                data: { rumorId, buyerId: userId }
            });

            // 4. Log transaction
            await tx.transactionLedger.create({
                data: {
                    userId,
                    amount: -rumor.price,
                    type: "PURCHASE",
                    referenceId: `rumor_${rumorId}`,
                    description: `Bought rumor from ${rumor.seller.username}`
                }
            });

            return {
                content: rumor.content,
                sellerReputation: rumor.reliabilityAt,
                message: "Purchase successful."
            };
        });
    }

    /**
     * Rate a purchased rumor to affect seller's reputation
     * @param {number} userId - Buyer ID
     * @param {number} purchaseId - Purchase entry ID
     * @param {number} rating - 1 (deceptive) to 5 (accurate)
     */
    async rateRumor(userId, purchaseId, rating) {
        if (rating < 1 || rating > 5) throw new Error("Rating must be 1-5.");

        return await this.runTransaction(async (tx) => {
            const purchase = await tx.tavernRumorPurchase.findUnique({
                where: { id: purchaseId },
                include: { rumor: true }
            });

            if (!purchase || purchase.buyerId !== userId) {
                throw new Error("Invalid purchase record.");
            }

            if (purchase.rating !== null) throw new Error("Already rated.");

            // Update rating
            await tx.tavernRumorPurchase.update({
                where: { id: purchaseId },
                data: { rating }
            });

            // Recalculate seller reputation
            const sellerId = purchase.rumor.sellerId;
            const allRatings = await tx.tavernRumorPurchase.findMany({
                where: { rumor: { sellerId }, NOT: { rating: null } },
                select: { rating: true }
            });

            const avgRating = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;
            const reputation = avgRating / 5.0; // scale to 0.0 - 1.0

            await tx.user.update({
                where: { id: sellerId },
                data: { informantReputation: reputation }
            });

            return { reputation, message: "Rating submitted." };
        });
    }
}

module.exports = new TavernRumorService();
