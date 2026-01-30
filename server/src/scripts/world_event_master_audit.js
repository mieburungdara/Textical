const eventService = require('../services/eventService');
const statService = require('../services/statService');
const gatheringService = require('../services/gatheringService');
const prisma = require('../db');

async function runEventMasterAudit() {
    console.log("--------------------------------------------------");
    console.log("🌌 STARTING DYNAMIC WORLD EVENT MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39; // Arthur
    const regionId = 1;

    // 0. Cleanup existing events
    await prisma.activeEvent.deleteMany({ where: { regionId } });
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: regionId } });

    // 1. Test Stat Impact: Mana Surge (+20 INT)
    console.log("[1/3] Testing Stat Impact (Mana Surge)...");
    const baseline = await statService.calculateHeroStats(heroId);
    console.log(`   Baseline INT: ${baseline.attributes.int}`);

    await eventService.triggerEvent(3, regionId, 60); // Trigger Mana Surge (ID 3)
    const boosted = await statService.calculateHeroStats(heroId);
    console.log(`   Boosted INT: ${boosted.attributes.int} (Expected: ${baseline.attributes.int + 20})`);

    const statPass = boosted.attributes.int === (baseline.attributes.int + 20);

    // 2. Test Gathering Impact: Meteor Shower (2.0x Mining Yield)
    console.log("[2/3] Testing Yield Impact (Meteor Shower)...");
    await eventService.triggerEvent(2, regionId, 60); // Trigger Meteor Shower (ID 2)
    
    // Setup a task manually to skip the timer
    const task = await prisma.taskQueue.create({
        data: {
            userId, heroId, type: "GATHERING", targetItemId: 2201, // Granite
            status: "RUNNING", startedAt: new Date(), finishesAt: new Date()
        }
    });

    console.log("   Completing Mining task during Meteor Shower...");
    await gatheringService.completeGathering(userId, task.id);

    // Check inventory for quantity
    const inv = await prisma.inventoryItem.findUnique({
        where: { userId_templateId: { userId, templateId: 2201 } }
    });
    
    // We expect 2 because Meteor Shower has mining_yield_mult: 2.0
    console.log(`   Mining Yield: ${inv.quantity} (Expected: 2)`);
    const yieldPass = inv.quantity >= 2;

    // 3. Final Verdict
    if (statPass && yieldPass) {
        console.log("\n🌟 FINAL VERDICT: DYNAMIC WORLD EVENT SYSTEM PERFECT.");
    } else {
        console.log(`\n❌ FINAL VERDICT: AUDIT FAILURE. StatPass: ${statPass}, YieldPass: ${yieldPass}`);
    }

    // Cleanup
    await prisma.activeEvent.deleteMany({ where: { regionId } });
    await prisma.inventoryItem.update({ where: { id: inv.id }, data: { quantity: 0 } });

    console.log("\n--------------------------------------------------");
}

runEventMasterAudit().catch(err => console.error(err));
