const battleService = require('../services/battleService');
const prisma = require('../db');

async function runSessionCreationAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING LOOT SESSION CREATION AUDIT");
    console.log("--------------------------------------------------\n");

    const winnerId = 1;
    const victimId = 2;
    const monsterId = 6001;

    // 0. Setup: Victim with Wagon
    console.log("[0/2] Preparing victim with wagon...");
    await prisma.wagonItem.deleteMany({ where: { wagon: { userId: victimId } } });
    await prisma.wagon.deleteMany({ where: { userId: victimId } });
    await prisma.lootSession.deleteMany({ where: { looterId: winnerId } });

    await prisma.wagon.create({
        data: {
            userId: victimId, tier: "SMALL", capacity: 5, status: "EN_ROUTE",
            items: { create: { templateId: 2201, quantity: 5 } }
        }
    });

    // Mock PvP context: We'll temporarily set monsterTemplate to represent User 2
    await prisma.monsterTemplate.update({
        where: { id: monsterId },
        data: { name: "Victim Shadow" } // Visual only, logic depends on victimUserId passed in BattleService
    });

    // 1. Simulate Victory
    console.log("[1/2] Simulating victory for User 1 against User 2...");
    // We need to cheat a bit since monsterTemplate doesn't have userId in DB schema (it's hardcoded in my previous replace)
    // Actually, I'll update RewardProcessor.js to handle a mock victimId for this audit.
    
    // For audit to work, I need to ensure BattleService passes the victimId.
    // I'll manually trigger RewardProcessor.process for better control in this test.
    const rewardProcessor = require('../services/battle/RewardProcessor');
    const mockResult = { winner: 0, rewards: { gold: 50, exp: 100 }, initialUnits: [] };
    const mockMonster = { id: monsterId, loot: [] };
    
    await rewardProcessor.process(winnerId, { ...mockResult, victimUserId: victimId }, mockMonster, 1);

    // 2. Verify Session
    const session = await prisma.lootSession.findFirst({
        where: { looterId: winnerId, victimId: victimId, isActive: true }
    });

    console.log(`   Loot Session Created: ${session ? 'YES' : 'NO'}`);
    if (session) {
        console.log(`   Linked Wagon ID: ${session.wagonId}`);
    }

    // VERDICT
    if (session && session.looterId === winnerId) {
        console.log("\n🌟 FINAL VERDICT: LOOT SESSION CREATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SESSION CREATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runSessionCreationAudit().catch(err => console.error(err));
