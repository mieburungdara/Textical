const resolver = require('../logic/social/BountyClaimResolver');

async function runBountyLogicAudit() {
    console.log("--------------------------------------------------");
    console.log("⚖️ STARTING BOUNTY CLAIM LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    const openBounty = { status: "OPEN" };
    const claimedBounty = { status: "CLAIMED" };

    // 1. Eligibility Check
    const canClaimOpen = resolver.canClaim(openBounty);
    const canClaimClosed = resolver.canClaim(claimedBounty);
    console.log(`   Can claim OPEN: ${canClaimOpen} (Expected: true)`);
    console.log(`   Can claim CLOSED: ${canClaimClosed} (Expected: false)`);

    // 2. Payout Calculation
    const reward = 500000n;
    const payout = resolver.resolveHunterPayout(reward);
    console.log(`   Hunter Payout: ${payout} (Expected: 500000)`);

    // VERDICT
    if (canClaimOpen === true && canClaimClosed === false && payout === reward) {
        console.log("\n🌟 FINAL VERDICT: BOUNTY LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runBountyLogicAudit().catch(err => console.error(err));
