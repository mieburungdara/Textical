/**
 * AAA BountyClaimResolver
 * Pure component for validating bounty claims and calculating payouts.
 */
class BountyClaimResolver {
    constructor() {
        this.HUNTER_SHARE = 1.0; // 100% payout for now
    }

    /**
     * Verifies if a bounty is eligible for claiming.
     */
    canClaim(bounty) {
        if (!bounty) return false;
        return bounty.status === "OPEN";
    }

    /**
     * Resolves the hunter's cut of the bounty reward.
     */
    resolveHunterPayout(rewardSilver) {
        return BigInt(Math.floor(Number(rewardSilver) * this.HUNTER_SHARE));
    }
}

module.exports = new BountyClaimResolver();
