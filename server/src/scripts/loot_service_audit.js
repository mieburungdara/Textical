const lootService = require('../services/logistics/LootService');
const prisma = require('../db');

async function runLootAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING LOOT SERVICE AUDIT");
    console.log("--------------------------------------------------\n");

    const looterId = 1;
    const victimId = 2;

    // 0. Setup: Create a Wagon for Victim
    console.log("[0/3] Preparing victim wagon...");
    await prisma.wagonItem.deleteMany({ where: { wagon: { userId: victimId } } });
    await prisma.wagon.deleteMany({ where: { userId: victimId } });
    await prisma.lootSession.deleteMany({ where: { looterId } });

    const wagon = await prisma.wagon.create({
        data: {
            userId: victimId, tier: "SMALL", capacity: 5, status: "EN_ROUTE",
            items: { create: { templateId: 2201, quantity: 5 } }
        }
    });

    // 1. Start Session
    console.log("[1/3] Starting loot session for User 1...");
    const session = await lootService.startLootSession(looterId, victimId, wagon.id);
    console.log(`   Session Created: ID ${session.id} (Expires: ${session.expiresAt})`);

    const active = await lootService.getActiveSession(looterId);
    console.log(`   Active Session Found: ${active ? 'YES' : 'NO'}`);

    // 2. Interrupt Session
    console.log("[2/3] Interrupting session (Simulating Attack)...");
    await lootService.interruptSession(looterId);

    // 3. Verify Destruction
    const finalWagon = await prisma.wagon.findUnique({ where: { id: wagon.id } });
    const finalSession = await prisma.lootSession.findUnique({ where: { id: session.id } });

    console.log(`   Wagon Exists: ${finalWagon ? 'YES' : 'NO'} (Expected: NO)`);
    console.log(`   Session Active: ${finalSession.isActive ? 'YES' : 'NO'} (Expected: NO)`);

    // VERDICT
    if (!finalWagon && !finalSession.isActive) {
        console.log("\n🌟 FINAL VERDICT: LOOT SERVICE LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOOT LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runLootAudit().catch(err => console.error(err));
