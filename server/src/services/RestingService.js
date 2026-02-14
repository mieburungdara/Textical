const BaseService = require('./BaseService');

/**
 * RestingService
 * Manages Resting XP accumulation and bonus application.
 */
class RestingService extends BaseService {
    constructor() {
        super();
        this.XP_PER_HOUR = 500; // Base XP accumulated per hour in Inn
        this.MAX_POOL_CAP = 10000; // Maximum Resting XP pool
        this.BONUS_XP_RATE = 1.5; // 1.5x XP when pool is active
    }

    /**
     * Calculate and update Resting XP pool after login
     * @param {number} userId 
     */
    async processLoginRest(userId) {
        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { currentRegion: true }
            });

            if (!user || !user.lastLogoutAt) return null;

            // Only accumulate if logout happened in an Inn
            if (!user.currentRegion?.hasInn) return null;

            const now = new Date();
            const elapsedHours = (now - new Date(user.lastLogoutAt)) / (1000 * 60 * 60);
            
            if (elapsedHours < 0.1) return null; // Minimum 6 minutes

            const accumulatedXp = Math.floor(elapsedHours * this.XP_PER_HOUR);
            const newPool = Math.min(this.MAX_POOL_CAP, user.restingXpPool + accumulatedXp);

            await tx.user.update({
                where: { id: userId },
                data: { restingXpPool: newPool }
            });

            return {
                gainedXp: newPool - user.restingXpPool,
                totalPool: newPool
            };
        });
    }

    /**
     * Consume Resting XP pool during reward processing
     * @param {number} userId 
     * @param {number} baseXp - Original XP gained from action
     */
    async consumeRestingXp(userId, baseXp) {
        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { restingXpPool: true, id: true }
            });

            if (!user || user.restingXpPool <= 0) return { bonusXp: 0, appliedXp: baseXp };

            const bonusMultiplier = this.BONUS_XP_RATE - 1.0; // 0.5 bonus
            let bonusXpRequested = Math.floor(baseXp * bonusMultiplier);
            
            // Limit bonus by pool availability
            const actualBonus = Math.min(bonusXpRequested, user.restingXpPool);

            await tx.user.update({
                where: { id: userId },
                data: { restingXpPool: { decrement: actualBonus } }
            });

            return {
                bonusXp: actualBonus,
                appliedXp: baseXp + actualBonus,
                poolRemaining: user.restingXpPool - actualBonus
            };
        });
    }
}

module.exports = new RestingService();
