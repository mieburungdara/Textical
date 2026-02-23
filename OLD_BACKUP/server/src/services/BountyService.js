const BaseService = require('./BaseService');

/**
 * BountyService
 * Manages the placement and claiming of Player Bounties.
 */
class BountyService extends BaseService {
    constructor() {
        super();
        this.MIN_BOUNTY = 100; // Minimum Silver to place a bounty
    }

    /**
     * Place a bounty on another player
     * @param {number} issuerId - Player putting up the money
     * @param {number} targetId - Player to be hunted
     * @param {number} rewardAmount - Silver reward
     */
    async placeBounty(issuerId, targetId, rewardAmount) {
        if (issuerId === targetId) {
            throw new Error("You cannot place a bounty on yourself.");
        }

        if (rewardAmount < this.MIN_BOUNTY) {
            throw new Error(`Minimum bounty is ${this.MIN_BOUNTY} Silver.`);
        }

        return await this.runTransaction(async (tx) => {
            const issuer = await tx.user.findUnique({
                where: { id: issuerId },
                select: { id: true, currency: true, username: true }
            });

            const target = await tx.user.findUnique({
                where: { id: targetId },
                select: { id: true, username: true }
            });

            if (!issuer) throw new Error("Issuer not found.");
            if (!target) throw new Error("Target player not found.");

            if (issuer.currency < rewardAmount) {
                throw new Error("Insufficient Silver to place this bounty.");
            }

            // Deduct reward from issuer
            await tx.user.update({
                where: { id: issuerId },
                data: { currency: { decrement: rewardAmount } }
            });

            // Create Bounty record
            const bounty = await tx.playerBounty.create({
                data: {
                    issuerUserId: issuerId,
                    targetUserId: targetId,
                    rewardAmount,
                    status: "ACTIVE"
                }
            });

            // Log transaction
            await tx.transactionLedger.create({
                data: {
                    userId: issuerId,
                    amount: -rewardAmount,
                    type: "CONTRACT_FEE",
                    description: `Placed Bounty on ${target.username}`,
                    balanceAfter: issuer.currency - rewardAmount
                }
            });

            return {
                message: `Bounty of ${rewardAmount} Silver placed on ${target.username}.`,
                bountyId: bounty.id
            };
        });
    }

    /**
     * Get all active bounties for the Notice Board
     */
    async getActiveBounties() {
        return await this.db.playerBounty.findMany({
            where: { status: "ACTIVE" },
            include: {
                targetUser: { select: { username: true } },
                issuerUser: { select: { username: true } }
            },
            orderBy: { rewardAmount: 'desc' }
        });
    }

    /**
     * Claim bounties after a kill
     * @param {number} killerId - Player who made the kill
     * @param {number} victimId - Player who was killed
     */
    async claimBounties(killerId, victimId) {
        if (killerId === victimId) return null;

        return await this.runTransaction(async (tx) => {
            const activeBounties = await tx.playerBounty.findMany({
                where: { 
                    targetUserId: victimId,
                    status: "ACTIVE"
                }
            });

            if (activeBounties.length === 0) return null;

            const totalReward = activeBounties.reduce((sum, b) => sum + b.rewardAmount, 0);

            // Mark bounties as claimed
            await tx.playerBounty.updateMany({
                where: { 
                    id: { in: activeBounties.map(b => b.id) }
                },
                data: { status: "CLAIMED" }
            });

            // Pay the killer
            const killer = await tx.user.update({
                where: { id: killerId },
                data: { currency: { increment: totalReward } }
            });

            // Log transactions
            await tx.transactionLedger.create({
                data: {
                    userId: killerId,
                    amount: totalReward,
                    type: "BOUNTY_REWARD",
                    description: `Claimed bounty reward for killing user ${victimId}`,
                    balanceAfter: killer.currency
                }
            });

            return {
                totalReward,
                bountiesClaimed: activeBounties.length
            };
        });
    }
}

module.exports = new BountyService();
