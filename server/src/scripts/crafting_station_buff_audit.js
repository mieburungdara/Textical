const craftingService = require('../services/craftingService');
const inventoryService = require('../services/inventoryService');
const prisma = require('../db');

async function runCraftingStationAudit() {
    console.log("--------------------------------------------------");
    console.log("🛠️ STARTING CRAFTING STATION BUFF AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 1; // Bronze Sword Recipe
    const ironIngotId = 2005;
    const regionId = 1;

    // 0. Setup
    console.log("[0/3] Preparing environment...");
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.regionalExtractionStats.deleteMany({ where: { regionId, templateId: ironIngotId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });

    // Ensure Recipe exists with ingredients
    await prisma.recipeIngredient.deleteMany({ where: { recipeId } });
    await prisma.recipeTemplate.upsert({
        where: { id: recipeId },
        update: { resultItemId: ironIngotId, craftTimeSeconds: 60 },
        create: { id: recipeId, name: "Bronze Sword Recipe", description: "Recipe for sword", resultItemId: 7001, craftTimeSeconds: 60 }
    });
    await prisma.recipeIngredient.create({
        data: { recipeId, itemId: ironIngotId, quantity: 3 }
    });

    // Clear and give materials
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.inventoryItem.create({
        data: { userId, templateId: ironIngotId, quantity: 10 }
    });
    await prisma.user.update({ where: { id: userId }, data: { energy: 100, currentRegion: regionId } });

    // Setup High Surplus (600 units)
    await prisma.regionalExtractionStats.create({
        data: { regionId, templateId: ironIngotId, volume24h: 600 }
    });

    // 1. Start Crafting
    console.log("[1/3] Starting crafting in high-surplus region (Expected: 30% speed boost)...");
    const task = await craftingService.startCrafting(userId, recipeId);
    
    // 2. Verify Duration
    const recipe = await prisma.recipeTemplate.findUnique({ where: { id: recipeId } });
    const duration = (new Date(task.finishesAt) - new Date(task.startedAt)) / 1000;
    const expectedDuration = Math.floor(recipe.craftTimeSeconds * 0.7);

    console.log(`   Recipe Base Time: ${recipe.craftTimeSeconds}s`);
    console.log(`   Actual Task Time: ${duration}s (Expected: ${expectedDuration}s)`);

    // VERDICT
    const durationPass = Math.abs(duration - expectedDuration) <= 1;

    if (durationPass) {
        console.log("\n🌟 FINAL VERDICT: REGIONAL STATION BUFFS PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: BUFF CALCULATION FAILURE.");
    }

    // Cleanup
    await prisma.regionalExtractionStats.deleteMany({ where: { regionId, templateId: ironIngotId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });

    console.log("\n--------------------------------------------------");
}

runCraftingStationAudit().catch(err => console.error(err));
