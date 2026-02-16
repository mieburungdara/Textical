const travelService = require('../services/travelService');
const prisma = require('../db');

async function runHaulingTravelAudit() {
    console.log("--------------------------------------------------");
    console.log("🚚 STARTING HAULING TRAVEL (MAP-STAY) AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const originId = 1;
    const targetId = 2;

    // 0. Setup
    console.log("[0/2] Preparing user at Origin...");
    // Clear tasks
    await prisma.taskQueue.deleteMany({ where: { userId } });
    await prisma.user.update({
        where: { id: userId },
        data: { currentRegion: originId, energy: 100, isKnockedOut: false, recoveryUntil: null }
    });

    // Ensure connection
    await prisma.regionConnection.deleteMany({ where: { originRegionId: originId, targetRegionId: targetId } });
    await prisma.regionConnection.create({
        data: { originRegionId: originId, targetRegionId: targetId, travelTimeSeconds: 15 }
    });

    // 1. Start Hauling Travel
    console.log("[1/2] Initiating HAULING travel to Region 2...");
    const task = await travelService.startTravel(userId, targetId, "HAULING");
    
    // 2. Verify Immediate Update + Task
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    console.log(`   Task Type: ${task.type} (Expected: HAULING_STAY)`);
    console.log(`   User Current Region: ${user.currentRegion} (Expected: 2)`);
    
    const duration = (new Date(task.finishesAt) - new Date(task.startedAt)) / 1000;
    console.log(`   Task Duration: ${duration}s (Expected: 60)`);

    // VERDICT
    const regionPass = user.currentRegion === targetId;
    const durationPass = Math.abs(duration - 60) < 1; // Tolerance for execution time

    if (regionPass && durationPass) {
        console.log("\n🌟 FINAL VERDICT: MAP-STAY TRAVEL LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: TRAVEL LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runHaulingTravelAudit().catch(err => console.error(err));
