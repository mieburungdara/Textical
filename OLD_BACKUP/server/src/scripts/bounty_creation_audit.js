const bountyService = require('../services/social/BountyService');
const prisma = require('../db');

async function runBountyCreationAudit() {
    console.log("--------------------------------------------------");
    console.log("📜 STARTING BOUNTY CREATION AUDIT");
    console.log("--------------------------------------------------\n");

    const targetId = 2; // Criminal
    const factionId = 1;

    // 0. Setup: Set negative reputation
    console.log("[0/2] Setting reputation to -5000...");
    await prisma.userReputation.upsert({
        where: { userId_factionId: { userId: targetId, factionId } },
        update: { amount: -5000 },
        create: { userId: targetId, factionId, amount: -5000 }
    });
    await prisma.bounty.deleteMany({ where: { targetId } });

    // 1. Generate Bounty
    console.log("[1/2] Generating bounty...");
    const bounty = await bountyService.generateBounty(targetId);
    
    // Expected: 5000 * 100 = 500,000 Silver
    const expected = 500000n;
    console.log(`   Result Reward: ${bounty.rewardSilver} Silver`);
    console.log(`   Expected: ${expected} Silver`);

    // VERDICT
    if (bounty && bounty.rewardSilver === expected && bounty.status === "OPEN") {
        console.log("\n🌟 FINAL VERDICT: BOUNTY CREATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: CREATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runBountyCreationAudit().catch(err => console.error(err));
