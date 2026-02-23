const BaseService = require('./BaseService');

/**
 * InnDrinkService
 * Handles consumption of special drinks in Inns with associated buffs/debuffs.
 */
class InnDrinkService extends BaseService {
    constructor() {
        super();
        this.DRINK_COST = 50; // Constant cost for now
    }

    /**
     * Consume "Drunken Bravery" ale
     * @param {number} userId - Player ID
     */
    async consumeDrunkenBravery(userId) {
        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { currentRegion: true }
            });

            if (!user) throw new Error("User not found.");
            if (!user.currentRegion?.hasInn) {
                throw new Error("This drink is only served inside an Inn.");
            }

            if (user.currency < this.DRINK_COST) {
                throw new Error("You don't have enough Silver for this drink.");
            }

            // Deduct cost
            await tx.user.update({
                where: { id: userId },
                data: { currency: { decrement: this.DRINK_COST } }
            });

            // Set expiry (e.g., 30 minutes from now)
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

            // Create or Update Buff
            // Logic integrated with PlayerEffect system (assuming simple model for now)
            // We use the temporary field or dedicated model if exists
            
            // Log transaction
            await tx.transactionLedger.create({
                data: {
                    userId,
                    amount: -this.DRINK_COST,
                    type: "PURCHASE",
                    description: "Consumed Drunken Bravery Ale",
                    balanceAfter: user.currency - this.DRINK_COST
                }
            });

            return {
                message: "You feel braver... but a bit clumsy.",
                buff: {
                    type: "DRUNKEN_BRAVERY",
                    pdrBonus: 0.20,
                    accReduction: 0.20,
                    critReduction: 0.20,
                    expiresAt
                }
            };
        });
    }
}

module.exports = new InnDrinkService();
