const rewardProcessor = require('../services/battle/RewardProcessor');
const bountyService = require('../services/social/BountyService');
const prisma = require('../db');

async function runMasterBountyAudit() {
    console.log("--------------------------------------------------");
    console.log("💀 STARTING BOUNTY SYSTEM MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const hunterId = 1;
    const traitorId = 2;
    const regionId = 1; // GREEN ZONE

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    await prisma.user.update({ where: { id: hunterId }, data: { silver: 0, gold: 0, currentRegion: regionId } });
    await prisma.user.update({ where: { id: traitorId }, data: { currentRegion: regionId } });
    
    // Clear old data
    await prisma.bounty.deleteMany({ where: { targetId: traitorId } });
    await prisma.lootSession.deleteMany({ where: { looterId: hunterId, victimId: traitorId } });

    // 1. Criminal Action (Simulate reputation loss)
    console.log("[1/4] User becomes a Traitor (-2500 Rep)...");
    await prisma.userReputation.upsert({
        where: { userId_factionId: { userId: traitorId, factionId: 1 } },
        update: { amount: -2500 },
        create: { userId: traitorId, factionId: 1, amount: -2500 }
    });

    // 2. Bounty Generation
    console.log("[2/4] Generating bounty for the Traitor...");
    const bounty = await bountyService.generateBounty(traitorId);
    console.log(`   Bounty Issued: ${bounty.rewardSilver} Silver.`);

    // 3. Hunter Action
    console.log("[3/4] Hunter kills Traitor in protected Green Zone...");
    const battleResult = {
        winner: 0,
        victimUserId: traitorId,
        initialUnits: [
            { teamId: 0, data: { db_id: 39 }, isDead: false },
            { teamId: 1, data: { db_id: 10 }, isDead: true }
        ],
        rewards: { exp: 50, gold: 0 }
    };
    await rewardProcessor.process(hunterId, battleResult, { loot: [] }, 1);

    // 4. Verify Social & Economic Impact
    console.log("[4/4] Verifying reward and loot override...");
    
    const finalBounty = await prisma.bounty.findUnique({ where: { id: bounty.id } });
    const hunterBalance = (await prisma.user.findUnique({ where: { id: hunterId } })).silver;
    const lootSession = await prisma.lootSession.findFirst({ 
        where: { looterId: hunterId, victimId: traitorId },
        orderBy: { id: 'desc' }
    });

    console.log(`   Bounty Status: ${finalBounty.status}`);
    console.log(`   Hunter Silver: ${hunterBalance}`);
    console.log(`   Full Loot Override: ${lootSession ? 'YES' : 'NO'}`);

    // VERDICT
    const payoutPass = finalBounty.status === "CLAIMED" && BigInt(hunterBalance) === BigInt(bounty.rewardSilver);
    const lootPass = !!lootSession;

    if (payoutPass && lootPass) {
        console.log("\n🌟 FINAL VERDICT: BOUNTY SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SYSTEM ARCHITECTURE FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterBountyAudit().catch(err => console.error(err));
