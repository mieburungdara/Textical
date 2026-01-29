const gatheringService = require('../services/gatheringService');
const prisma = require('../db');

async function runLumberingAudit() {
    console.log("--------------------------------------------------");
    console.log("🌲 STARTING LUMBERING (WOOD) MODULAR AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 999; 

    // Setup hero
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { str: 20, userId: userId },
        create: { id: heroId, userId: userId, name: "Lumberjack", classId: 1001, str: 20 }
    });

    const resource = await prisma.regionResource.findFirst({
        where: { regionId: 1, itemId: 2401 }, // Oak Wood
        include: { item: true }
    });

    if (!resource) {
        console.log("❌ Error: Oak Wood resource not found in Region 1.");
        return;
    }

    console.log(`   Attempting to harvest ${resource.item.name}...`);
    try {
        const task = await gatheringService.startGathering(userId, heroId, resource.id);
        const duration = (task.finishesAt - task.startedAt) / 1000;
        
        console.log(`   ✅ Success: Lumbering task started.`);
        console.log(`   Duration: ${duration}s (Base: 12s, STR Factor: 2.0)`);

        if (duration === 6) { 
            console.log("\n🌟 FINAL VERDICT: LUMBERING LOGIC PERFECT.");
        } else {
            console.log("\n❌ FINAL VERDICT: LOGIC MISMATCH.");
        }

        await prisma.taskQueue.delete({ where: { id: task.id } });
    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    console.log("\n--------------------------------------------------");
}

runLumberingAudit().catch(err => console.error(err));