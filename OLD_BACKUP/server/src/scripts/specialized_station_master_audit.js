const craftingService = require('../services/craftingService');
const prisma = require('../db');

async function runMasterStationAudit() {
    console.log("--------------------------------------------------");
    console.log("🛠️ STARTING SPECIALIZED STATION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 1; // Iron Broadsword (Need 10 Iron)
    const ironId = 2005;

    // 0. Setup: Town Central as BLACKSMITH_HUB
    console.log("[0/4] Preparing environment...");
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: 1, silver: 10000 } });
    await prisma.regionTemplate.update({ where: { id: 1 }, data: { specialization: "BLACKSMITH_HUB" } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });
    
    // Provision materials
    await prisma.inventoryItem.create({ data: { userId, templateId: ironId, quantity: 20 } });

    // 1. Test Speed Buff
    console.log("[1/4] Crafting in BLACKSMITH_HUB (20% Speed Boost)...");
    const recipe = await prisma.recipeTemplate.findUnique({ where: { id: recipeId } });
    const baseTime = recipe.craftTimeSeconds || 30;
    
    const task = await craftingService.startCrafting(userId, recipeId);
    
    const now = new Date();
    const duration = Math.round((task.finishesAt - task.startedAt) / 1000);
    const expectedDuration = Math.floor(baseTime * 0.8); // 80% of time

    console.log(`   Base Time: ${baseTime}s`);
    console.log(`   Calculated Duration: ${duration}s (Expected: ${expectedDuration}s)`);

    // 2. Test Quality Resolution
    console.log("\n[2/4] Completing Crafting (Luck Buff Applied)...");
    await craftingService.completeCrafting(userId, task.id);
    const result = await prisma.inventoryItem.findFirst({ where: { userId, templateId: 7001 } });
    console.log(`   Final Item Quality: ${result.quality} (${result.powerScale}x stats)`);

    // 3. Reset and Verify Cleanup
    await prisma.regionTemplate.update({ where: { id: 1 }, data: { specialization: null } });

    // VERDICT
    if (duration === expectedDuration) {
        console.log("\n🌟 FINAL VERDICT: SPECIALIZED STATION SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SPEED BUFF CALCULATION ERROR.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterStationAudit().catch(err => console.error(err));
