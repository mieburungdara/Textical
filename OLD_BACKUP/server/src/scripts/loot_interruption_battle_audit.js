const battleService = require('../services/battleService');
const lootService = require('../services/logistics/LootService');
const prisma = require('../db');

async function runBattleInterruptionAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING BATTLE LOOT INTERRUPTION AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const victimId = 2;
    const monsterId = 6001;

    // 0. Setup: Active Loot Session
    console.log("[0/2] Preparing active loot session for User 1...");
    await prisma.wagonItem.deleteMany({ where: { wagon: { userId: victimId } } });
    await prisma.wagon.deleteMany({ where: { userId: victimId } });
    await prisma.lootSession.deleteMany({ where: { looterId: userId } });

    const wagon = await prisma.wagon.create({
        data: {
            userId: victimId, tier: "SMALL", capacity: 5, status: "EN_ROUTE",
            items: { create: { templateId: 2201, quantity: 5 } }
        }
    });

    await lootService.startLootSession(userId, victimId, wagon.id);

    // 1. Trigger Battle (This should interrupt)
    console.log("[1/2] User 1 starts a new battle while looting...");
    // Ensure monster is there
    await prisma.regionMonster.deleteMany({ where: { regionId: 1, monsterId } });
    await prisma.regionMonster.create({ data: { regionId: 1, monsterId } });
    await prisma.user.update({ where: { id: userId }, data: { energy: 100, currentRegion: 1 } });

    await battleService.startBattle(userId, monsterId);

    // 2. Verify Destruction
    const finalWagon = await prisma.wagon.findUnique({ where: { id: wagon.id } });
    const session = await prisma.lootSession.findFirst({ where: { looterId: userId } });

    console.log(`   Wagon Exists: ${finalWagon ? 'YES' : 'NO'} (Expected: NO)`);
    console.log(`   Session Active: ${session.isActive ? 'YES' : 'NO'} (Expected: NO)`);

    // VERDICT
    if (!finalWagon && !session.isActive) {
        console.log("\n🌟 FINAL VERDICT: BATTLE INTERRUPTION INTEGRATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: INTERRUPTION FAILED.");
    }

    console.log("\n--------------------------------------------------");
}

runBattleInterruptionAudit().catch(err => console.error(err));
