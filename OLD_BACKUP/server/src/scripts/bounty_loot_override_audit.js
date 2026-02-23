const rewardProcessor = require('../services/battle/RewardProcessor');
const bountyService = require('../services/social/BountyService');
const prisma = require('../db');

async function runBountyOverrideAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING BOUNTY LOOT OVERRIDE AUDIT");
    console.log("--------------------------------------------------\n");

    const hunterId = 1;
    const traitorId = 2;
    const regionId = 1; // Green Zone

    // 0. Setup: Traitor has -5000 rep and an open bounty
    console.log("[0/3] Preparing environment (Region 1: GREEN)...");
    await prisma.user.update({ where: { id: hunterId }, data: { silver: 0, gold: 0, currentRegion: regionId } });
    await prisma.user.update({ where: { id: traitorId }, data: { currentRegion: regionId } });
    
    await prisma.userReputation.upsert({
        where: { userId_factionId: { userId: traitorId, factionId: 1 } },
        update: { amount: -5000 },
        create: { userId: traitorId, factionId: 1, amount: -5000 }
    });
    
    await prisma.bounty.deleteMany({ where: { targetId: traitorId } });
    const bounty = await bountyService.generateBounty(traitorId);
    console.log(`   Active Bounty: ${bounty.rewardSilver} Silver`);

    // 1. Simulate Battle Victory
    console.log("\n[1/3] Simulating Hunter victory over Traitor...");
    const mockBattleResult = {
        winner: 0, // Team 0 (Hunter) won
        victimUserId: traitorId,
        initialUnits: [
            { teamId: 0, data: { db_id: 39 }, isDead: false },
            { teamId: 1, data: { db_id: 10 }, isDead: true } // Mock traitor unit
        ],
        rewards: { exp: 100, gold: 0 }
    };

    // We need a monsterTemplate even for PvP? (Or refactor RewardProcessor)
    // For now passing empty
    const mockMonster = { loot: [] };

    await rewardProcessor.process(hunterId, mockBattleResult, mockMonster, 1);

    // 2. Verify Claims
    console.log("\n[2/3] Verifying Bounty Claim and Loot Session...");
    const updatedBounty = await prisma.bounty.findUnique({ where: { id: bounty.id } });
    const hunter = await prisma.user.findUnique({ where: { id: hunterId } });
    const lootSession = await prisma.lootSession.findFirst({
        where: { looterId: hunterId, victimId: traitorId },
        orderBy: { id: 'desc' }
    });

    console.log(`   Bounty Status: ${updatedBounty.status} (Expected: CLAIMED)`);
    console.log(`   Hunter Silver: ${hunter.silver} (Expected: 500000)`);
    console.log(`   Loot Session Created: ${lootSession ? 'YES' : 'NO'} (Expected: YES)`);

    // VERDICT
    const bountyPass = updatedBounty.status === "CLAIMED" && hunter.silver === 500000;
    const overridePass = !!lootSession;

    if (bountyPass && overridePass) {
        console.log("\n🌟 FINAL VERDICT: BOUNTY OVERRIDE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: OVERRIDE FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runBountyOverrideAudit().catch(err => console.error(err));
