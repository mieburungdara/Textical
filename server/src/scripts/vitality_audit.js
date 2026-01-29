const vitalityService = require('../services/vitalityService');
const prisma = require('../db');

async function runVitalityAudit() {
    console.log("--------------------------------------------------");
    console.log("🔋 STARTING VITALITY MODULAR AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1; // Assuming Admin/Test User exists
    
    console.log("[1/3] Resetting User Vitality State...");
    await prisma.user.update({
        where: { id: userId },
        data: {
            vitality: 50,
            lastVitalityUpdate: new Date(Date.now() - (600 * 1000)), // 10 minutes ago
            isInTavern: false,
            tavernTimeSecondsToday: 0
        }
    });

    console.log("[2/3] Syncing Vitality (Idle Regen).");
    const user = await vitalityService.syncUserVitality(userId);
    console.log(`   Initial: 50 | After 10m: ${user.vitality} (Expected: 52)`);

    console.log("\n[3/3] Testing Tavern Mechanics...");
    await vitalityService.enterTavern(userId);
    const inTavern = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Is In Tavern: ${inTavern.isInTavern} | Entry: ${inTavern.tavernEntryAt}`);

    if (user.vitality >= 52 && inTavern.isInTavern) {
        console.log("\n✅ VITALITY AUDIT PASSED: Modular logic is synchronized.");
    } else {
        console.log("\n❌ VITALITY AUDIT FAILED: Check Calculator or Tracker logic.");
    }
}

runVitalityAudit().catch(err => console.error(err));
