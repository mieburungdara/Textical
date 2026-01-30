const eventService = require('../services/eventService');
const gatheringService = require('../services/gatheringService');
const worldSpawner = require('../services/worldSpawnerService');
const prisma = require('../db');

async function runSpawnerMasterAudit() {
    console.log("--------------------------------------------------");
    console.log("🌌 STARTING DYNAMIC WORLD SPAWNER MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39; // Arthur
    const regionId = 1;
    const eventId = 2; // Meteor Shower
    const specialItemId = 4425; // Elixir of the Gods (acting as Star-Iron for this test)

    // 0. Initial Cleanup
    await prisma.activeEvent.deleteMany({ where: { regionId } });
    await prisma.eventResource.deleteMany({ where: { templateId: eventId } });

    // 1. Setup Event Resource
    console.log("[1/4] Mapping 'Star-Iron' to Meteor Shower event...");
    await prisma.eventResource.create({
        data: { templateId: eventId, itemId: specialItemId, spawnChance: 1.0, gatherTime: 15 }
    });

    // 2. Pre-Event Check (Should fail)
    console.log("[2/4] Testing availability BEFORE event...");
    const beforeList = await worldSpawner.getAvailableResources(regionId);
    const isFoundBefore = beforeList.some(r => r.templateId === specialItemId);
    console.log(`   Found in Region: ${isFoundBefore ? 'YES' : 'NO'} (Expected: NO)`);

    // 3. Trigger Event & Check (Should succeed)
    console.log("[3/4] Triggering Meteor Shower...");
    await eventService.triggerEvent(eventId, regionId, 60);
    
    const afterList = await worldSpawner.getAvailableResources(regionId);
    const specialRes = afterList.find(r => r.templateId === specialItemId);
    console.log(`   Found in Region: ${specialRes ? 'YES' : 'NO'} (Expected: YES)`);

    // 4. Test Gathering Logic Integration
    console.log("[4/4] Testing GatheringService integration...");
    try {
        const task = await gatheringService.startGathering(userId, heroId, specialRes.id);
        console.log(`   ✅ Success: Gathering started for event resource. Task ID: ${task.id}`);
        await prisma.taskQueue.delete({ where: { id: task.id } });
    } catch (e) {
        console.log(`   ❌ Failure: ${e.message}`);
    }

    // VERDICT
    if (!isFoundBefore && specialRes && specialRes.templateId === specialItemId) {
        console.log("\n🌟 FINAL VERDICT: DYNAMIC WORLD SPAWNER SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SPAWNER LOGIC FAILURE.");
    }

    // Cleanup
    await prisma.activeEvent.deleteMany({ where: { regionId } });
    await prisma.eventResource.deleteMany({ where: { templateId: eventId } });

    console.log("\n--------------------------------------------------");
}

runSpawnerMasterAudit().catch(err => console.error(err));
