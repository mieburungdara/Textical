const BaseService = require('./BaseService');

/**
 * InnSocialService
 * Handles social interactions within Inns, such as hiring Bards.
 */
class InnSocialService extends BaseService {
    constructor() {
        super();
        this.BARD_COST = 200; // Cost in Silver to hire a Bard
        this.BARD_DURATION_MINUTES = 60; // How long the buff lasts
    }

    /**
     * Hire a Bard for a specific region
     * @param {number} userId - Player hiring the bard
     * @param {number} regionId - Region to host the bard
     */
    async hireBard(userId, regionId) {
        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { id: true, username: true, currency: true }
            });

            const region = await tx.regionTemplate.findUnique({
                where: { id: regionId }
            });

            if (!user) throw new Error("User not found.");
            if (!region || !region.hasInn) {
                throw new Error("This region does not have an Inn for a Bard to perform.");
            }

            if (user.currency < this.BARD_COST) {
                throw new Error("You don't have enough Silver to hire a Bard.");
            }

            // Deduct cost
            await tx.user.update({
                where: { id: userId },
                data: { currency: { decrement: this.BARD_COST } }
            });

            const expiresAt = new Date(Date.now() + this.BARD_DURATION_MINUTES * 60000);

            // Create Bard Event
            const bardEvent = await tx.innBardEvent.create({
                data: {
                    regionId,
                    hiredByUserId: userId,
                    hiredByName: user.username,
                    expiresAt
                }
            });

            // Log transaction
            await tx.transactionLedger.create({
                data: {
                    userId,
                    amount: -this.BARD_COST,
                    type: "PURCHASE",
                    description: `Hired a Bard in ${region.name}`,
                    balanceAfter: user.currency - this.BARD_COST
                }
            });

            return {
                message: `You hired a Bard! Their music will inspire everyone in ${region.name}.`,
                bardName: "The Wandering Minstrel",
                expiresAt,
                eventId: bardEvent.id
            };
        });
    }

    /**
     * Get active Bard event for a region
     * @param {number} regionId 
     */
    async getActiveBard(regionId) {
        return await this.db.innBardEvent.findFirst({
            where: {
                regionId,
                expiresAt: { gt: new Date() }
            },
            orderBy: { expiresAt: 'desc' }
        });
    }
}

module.exports = new InnSocialService();
