const gatheringService = require('../services/gatheringService');
const extractionTracker = require('../services/economy/ExtractionTrackerService');
const prisma = require('../db');

async function runGatheringSyncAudit() {
    console.log("--------------------------------------------------");
    console.log("⛏️ STARTING GATHERING EXTRACTION SYNC AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39;
    const templateId = 2005; // Iron Ingot
    const regionId = 1;

    // 0. Setup: Clean state and provide materials
    console.log("[0/3] Preparing environment...");
    await prisma.regionalExtractionStats.deleteMany({ where: { regionId, templateId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });
    
    // Create a manual task record to simulate completion
    const task = await prisma.taskQueue.create({
        data: {
            userId, heroId, type: "GATHERING", targetItemId: templateId,
            status: "RUNNING", startedAt: new Date(), finishesAt: new Date()
        }
    });

    // 1. Complete Gathering
    console.log("[1/3] Completing simulated gathering task...");
    await gatheringService.completeGathering(userId, task.id);

    // 2. Verify Stats Update
    console.log("[2/3] Verifying extraction stats update...");
    const stats = await extractionTracker.getStats(regionId, templateId);
    
    console.log(`   Recorded Volume: ${stats ? stats.volume24h : 'NULL'} (Expected: 1)`);

    // VERDICT
    if (stats && stats.volume24h === 1) {
        console.log("\n🌟 FINAL VERDICT: GATHERING SYNC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SYNC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runGatheringSyncAudit().catch(err => console.error(err));
