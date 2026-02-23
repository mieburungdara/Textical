const BaseService = require('../BaseService');
const transactionManager = require('../economy/TransactionManager');

/**
 * BountyService
 * Orchestrates the generation and claiming of criminal bounties.
 */
class BountyService extends BaseService {
    constructor() {
        super();
        this.TRAITOR_THRESHOLD = -1000;
        this.REWARD_MULT = 100; // 100 Silver per negative reputation point
    }

    /**
     * Checks if a user is a traitor and generates a bounty if so.
     */
    async generateBounty(userId) {
        const reps = await this.db.userReputation.findMany({
            where: { userId, amount: { lt: this.TRAITOR_THRESHOLD } }
        });

        if (reps.length === 0) return null;

        // Take the most negative reputation
        const worstRep = reps.reduce((min, r) => r.amount < min.amount ? r : min, reps[0]);
        const reward = BigInt(Math.abs(worstRep.amount)) * BigInt(this.REWARD_MULT);

        const user = await this.db.user.findUnique({ where: { id: userId } });

        // Check if there is already an open bounty for this target
        const existing = await this.db.bounty.findFirst({
            where: { targetId: userId, status: "OPEN" }
        });

        if (existing) {
            // Update reward if it has increased
            if (reward > existing.rewardSilver) {
                return await this.db.bounty.update({
                    where: { id: existing.id },
                    data: { rewardSilver: reward }
                });
            }
            return existing;
        }

        return await this.db.bounty.create({
            data: {
                targetId: userId,
                rewardSilver: reward,
                regionId: user.currentRegion,
                status: "OPEN"
            }
        });
    }

    /**
     * Retrieves active bounties.
     */
    async getActiveBounties(regionId = null) {
        const where = { status: "OPEN" };
        if (regionId) where.regionId = regionId;

        return await this.db.bounty.findMany({
            where,
            include: { target: { select: { username: true, currentRegion: true } } },
            orderBy: { rewardSilver: 'desc' }
        });
    }

    /**
     * Claims a bounty upon a confirmed kill.
     */
    async claimBounty(tx, targetId, hunterId) {
        const bounty = await tx.bounty.findFirst({
            where: { targetId, status: "OPEN" }
        });

        if (!bounty) return null;

        // 1. Mark as Claimed
        const updated = await tx.bounty.update({
            where: { id: bounty.id },
            data: { 
                status: "CLAIMED", 
                hunterId,
                claimedAt: new Date()
            }
        });

        // 2. Payout Hunter (Kingdom Subsidy)
        await transactionManager.addCurrency(tx, hunterId, bounty.rewardSilver, "BOUNTY_CLAIM", bounty.id, "BOUNTY");

        this.log(`Bounty ID ${bounty.id} claimed by User ${hunterId} for killing User ${targetId}.`, "Bounty");
        return updated;
    }
}

module.exports = new BountyService();
