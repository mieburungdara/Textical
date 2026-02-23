const BaseService = require('./BaseService');
const transactionManager = require('./economy/TransactionManager');

/**
 * EscortService
 * Manages hiring of Safe-Passage Scouts to avoid bandit ambushes.
 */
class EscortService extends BaseService {
    constructor() {
        super();
        this.ESCORT_FEE = 500; // Silver
        this.ESCORT_DURATION_GRIDS = 10;
        this.ESCORT_NAME = "Safe-Passage Scout";
    }

    /**
     * Hire a scout to protect the player during travel.
     * @param {number} userId 
     */
    async hireEscort(userId) {
        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { silver: true, escortGridsRemaining: true }
            });

            if (!user) throw new Error("User not found.");
            
            // Check if already has an escort
            if (user.escortGridsRemaining > 0) {
                throw new Error("Kamu sudah memiliki pengawal aktif.");
            }

            // 1. Deduct Silver
            await transactionManager.removeCurrency(tx, userId, BigInt(this.ESCORT_FEE), "ESCORT_HIRE", null, "NPC");

            // 2. Update User Escort Stats
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    activeEscortName: this.ESCORT_NAME,
                    escortGridsRemaining: this.ESCORT_DURATION_GRIDS
                }
            });

            this.log(`User ${userId} hired ${this.ESCORT_NAME} for ${this.ESCORT_FEE} silver (10 grids).`, "Escort");

            return {
                success: true,
                message: `${this.ESCORT_NAME} kini menjagamu. Perlindungan berlaku untuk 10 wilayah ke depan.`,
                escortName: this.ESCORT_NAME,
                gridsRemaining: this.ESCORT_DURATION_GRIDS
            };
        });
    }

    /**
     * Get current escort status for a user
     * @param {number} userId 
     */
    async getStatus(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            select: { activeEscortName: true, escortGridsRemaining: true }
        });

        return {
            hasEscort: user.escortGridsRemaining > 0,
            name: user.activeEscortName,
            remaining: user.escortGridsRemaining
        };
    }
}

module.exports = new EscortService();
