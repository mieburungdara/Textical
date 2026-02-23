const craftingService = require('../services/craftingService');
const extractionTracker = require('../services/economy/ExtractionTrackerService');
const prisma = require('../db');

async function runMasterStationAudit() {
    console.log("--------------------------------------------------");
    console.log("🛠️ STARTING SPECIALIZED STATIONS MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 1; // Bronze Sword
    const ironIngotId = 2005;
    const regionId = 1;

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    const heroes = await prisma.hero.findMany({ where: { userId } });
    for (const h of heroes) await prisma.heroEquipment.deleteMany({ where: { heroId: h.id } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.regionalExtractionStats.deleteMany({ where: { regionId, templateId: ironIngotId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });

    await prisma.inventoryItem.create({ data: { userId, templateId: ironIngotId, quantity: 10 } });
    await prisma.user.update({ where: { id: userId }, data: { gold: 10000, currentRegion: regionId } });

    // Ensure Recipe 1 results in 7001
    await prisma.recipeIngredient.deleteMany({ where: { recipeId } });
    await prisma.recipeTemplate.upsert({
        where: { id: recipeId },
        update: { resultItemId: 7001, craftTimeSeconds: 60 },
        create: { id: recipeId, name: "Bronze Sword Recipe", description: "Recipe for sword", resultItemId: 7001, craftTimeSeconds: 60 }
    });
    await prisma.recipeIngredient.create({
        data: { recipeId, itemId: ironIngotId, quantity: 3 }
    });

    // 1. Record Surplus
    console.log("[1/4] Recording High Surplus (+600 Iron)...");
    await extractionTracker.recordExtraction(regionId, ironIngotId, 600);

    // 2. Start Crafting
    console.log("[2/4] Starting crafting task...");
    const task = await craftingService.startCrafting(userId, recipeId);
    
    // 3. Verify Boost
    const duration = (new Date(task.finishesAt) - new Date(task.startedAt)) / 1000;
    // Base 60s -> 30% boost = 42s
    console.log(`   Actual Crafting Time: ${duration}s (Expected: 42s)`);

    // 4. Complete Crafting
    console.log("[4/4] Completing crafting task...");
    const completeRes = await craftingService.completeCrafting(userId, task.id);
    console.log(`   Complete Result: ${JSON.stringify(completeRes)}`);
    const result = await prisma.inventoryItem.findFirst({ where: { userId, templateId: 7001 } });
    console.log(`   Crafted Item Found: ${result ? 'YES' : 'NO'}`);

    // VERDICT
    const speedPass = duration === 42;
    const completionPass = !!result;

    if (speedPass && completionPass) {
        console.log("\n🌟 FINAL VERDICT: SPECIALIZED STATIONS PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SYSTEM FAILURE.");
    }

    // Cleanup
    await prisma.regionalExtractionStats.deleteMany({ where: { regionId, templateId: ironIngotId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });

    console.log("\n--------------------------------------------------");
}

runMasterStationAudit().catch(err => console.error(err));
