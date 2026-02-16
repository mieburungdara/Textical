const energyService = require('../services/energyService');
const prisma = require('../db');

async function runEnergyAudit() {
    console.log("--------------------------------------------------");
    console.log("⚡ STARTING ENERGY MODULAR AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1; // Assuming Admin/Test User exists
    
    console.log("[1/3] Resetting User Energy State...");
    await prisma.user.update({
        where: { id: userId },
        data: {
            energy: 50,
            lastEnergyUpdate: new Date(Date.now() - (600 * 1000)), // 10 minutes ago
            isInTavern: false,
            tavernTimeSecondsToday: 0
        }
    });

    console.log("[2/3] Syncing Energy (Idle Regen).");
    const user = await energyService.syncUserEnergy(userId);
    console.log(`   Initial: 50 | After 10m: ${user.energy} (Expected: 52)`);

    console.log("\n[3/3] Testing Tavern Mechanics...");
    await energyService.enterTavern(userId);
    const inTavern = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Is In Tavern: ${inTavern.isInTavern} | Entry: ${inTavern.tavernEntryAt}`);

    if (user.energy >= 52 && inTavern.isInTavern) {
        console.log("\n✅ ENERGY AUDIT PASSED: Modular logic is synchronized.");
    } else {
        console.log("\n❌ ENERGY AUDIT FAILED: Check Calculator or Tracker logic.");
    }
}

runEnergyAudit().catch(err => console.error(err));
