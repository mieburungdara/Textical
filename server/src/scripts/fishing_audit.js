const gatheringService = require('../services/gatheringService');
const craftingService = require('../services/craftingService');
const prisma = require('../db');

async function runFishingAudit() {
    console.log("--------------------------------------------------");
    console.log("🎣 STARTING FISHING & COOKING AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 997; 

    // 1. Setup Hero with high DEX and move to correct region (Region 4 has Moon-Carp)
    console.log("[1/4] Setting up hero (DEX: 40) and Region 4...");
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: 4 } });
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { dex: 40, userId: userId },
        create: { id: heroId, userId: userId, name: "Angler", classId: 1001, dex: 40 }
    });

    // 2. Test Fishing (Moon-Carp - Base 10s)
    const resource = await prisma.regionResource.findFirst({
        where: { regionId: 4, itemId: 3311 }, // Moon-Carp in Region 4
        include: { item: true }
    });

    if (!resource) {
        console.log("❌ Error: Moon-Carp resource not found in Region 4.");
        return;
    }

    console.log(`[2/4] Attempting to catch ${resource.item.name}...`);
    try {
        const gatherTask = await gatheringService.startGathering(userId, heroId, resource.id);
        const duration = (gatherTask.finishesAt - gatherTask.startedAt) / 1000;
        
        console.log(`   ✅ Success: Fishing started.`);
        console.log(`   Duration: ${duration}s (Base: 10s, DEX Factor: 4.0)`);

        if (duration === 3) { 
            console.log("   🌟 FISHING LOGIC: PERFECT.");
        } else {
            console.log(`   ❌ FISHING LOGIC: MISMATCH. Found ${duration}s, expected 3s.`);
        }
        await prisma.taskQueue.delete({ where: { id: gatherTask.id } });
    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    // 3. Setup Cooking Ingredients (4 Moon-Carp -> 2 Glow-Fillet)
    console.log("\n[3/4] Setting up cooking ingredients...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 3311 } },
        update: { quantity: 10 },
        create: { userId, templateId: 3311, quantity: 10 }
    });

    // 4. Test Cooking (Glow-Fillet)
    console.log("[4/4] Attempting to prepare Glow-Fillet...");
    const recipeId = 5811; 
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId }
    });

    try {
        // Must be in TOWN to craft. Region 4 is FOREST.
        // We already have a "Town-only" check in CraftingService.
        // I will temporarily make Region 4 a TOWN for the audit then revert.
        await prisma.regionTemplate.update({ where: { id: 4 }, data: { visualType: "TOWN" } });

        const craftTask = await craftingService.startCrafting(userId, recipeId);
        console.log(`   ✅ Success: Cooking started. Task ID: ${craftTask.id}`);
        
        const fishRem = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId, templateId: 3311 } } });
        console.log(`   Moon-Carp remaining: ${fishRem.quantity} (Expected: 8)`);
        
        if (fishRem.quantity === 8) {
            console.log("\n🌟 FINAL VERDICT: FISHING & COOKING FULLY OPERATIONAL.");
        } else {
            console.log("\n❌ FINAL VERDICT: MATERIAL DEDUCTION FAILED.");
        }

        await prisma.taskQueue.delete({ where: { id: craftTask.id } });
        
        // Revert region type
        await prisma.regionTemplate.update({ where: { id: 4 }, data: { visualType: "FOREST" } });

    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    console.log("\n--------------------------------------------------");
}

runFishingAudit().catch(err => console.error(err));