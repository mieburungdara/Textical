const haulingService = require('../services/logistics/HaulingService');
const travelService = require('../services/travelService');
const prisma = require('../db');

async function runAmbushAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING AMBUSH TICK AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const greenRegionId = 1; // Danger 1
    const redRegionId = 5;   // Danger 8

    // Helper to start hauling
    const startHaul = async (targetId) => {
        await prisma.taskQueue.deleteMany({ where: { userId } });
        await prisma.regionConnection.deleteMany({ where: { originRegionId: 1, targetRegionId: targetId } });
        await prisma.regionConnection.create({
            data: { originRegionId: 1, targetRegionId: targetId }
        });
        await prisma.user.update({ where: { id: userId }, data: { currentRegion: 1, vitality: 100 } });
        await travelService.startTravel(userId, targetId, "HAULING");
    };

    // 1. Test GREEN ZONE (Safe)
    console.log("[1/2] Testing GREEN ZONE Tick...");
    await startHaul(greenRegionId);
    await prisma.regionTemplate.update({ where: { id: greenRegionId }, data: { zoneType: "GREEN", dangerLevel: 1 } });
    
    const greenResult = await haulingService.processTick(userId);
    console.log(`   Status: ${greenResult.status} (Expected: SAFE)`);

    // 2. Test RED ZONE (Dangerous)
    console.log("\n[2/2] Testing RED ZONE Tick (High Danger)...");
    await startHaul(redRegionId);
    await prisma.regionTemplate.update({ where: { id: redRegionId }, data: { zoneType: "RED", dangerLevel: 20 } }); // 100% chance
    
    const redResult = await haulingService.processTick(userId);
    console.log(`   Status: ${redResult.status} (Expected: AMBUSH_TRIGGERED)`);

    // VERDICT
    if (greenResult.status === "SAFE" && redResult.status === "AMBUSH_TRIGGERED") {
        console.log("\n🌟 FINAL VERDICT: AMBUSH LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: AMBUSH LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runAmbushAudit().catch(err => console.error(err));
