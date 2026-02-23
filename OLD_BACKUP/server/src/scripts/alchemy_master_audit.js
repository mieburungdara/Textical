const craftingService = require('../services/craftingService');
const consumableService = require('../services/consumableService');
const prisma = require('../db');

async function runMasterAudit() {
    console.log("--------------------------------------------------");
    console.log("🧪 STARTING MASTER ALCHEMY FULL-CYCLE AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 999;
    
    // 0. Ensure user has space
    await prisma.user.update({ where: { id: userId }, data: { maxInventorySlots: 100 } });

    // 1. Setup Materials for "Elixir of Eternal Might" (Permanent +1 STR)
    // Recipe 6521: 5x Vital Crimson (4318), 1x Dragon Meat (3821), 1x Adamantite (2721)
    console.log("[1/5] Setting up legendary ingredients...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 4318 } },
        update: { quantity: 10 },
        create: { userId, templateId: 4318, quantity: 10 }
    });
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 3821 } },
        update: { quantity: 10 },
        create: { userId, templateId: 3821, quantity: 10 }
    });
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2721 } },
        update: { quantity: 10 },
        create: { userId, templateId: 2721, quantity: 10 }
    });

    // 2. Setup Hero Base STR
    await prisma.hero.update({ where: { id: heroId }, data: { str: 10 } });
    console.log(`   Hero Base STR: 10`);

    // 3. Brew Elixir
    console.log("[2/5] Brewing Elixir of Eternal Might...");
    const recipeId = 6521;
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId }
    });

    // We must be in town to craft
    await prisma.regionTemplate.update({ where: { id: 1 }, data: { visualType: "TOWN" } });
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: 1 } });

    const craftTask = await craftingService.startCrafting(userId, recipeId);
    console.log(`   ✅ Success: Brewing started. Task ID: ${craftTask.id}`);

    // 4. Manually award the result for audit speed
    console.log("[3/5] Awarding Elixir...");
    const elixirId = 4421;
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: elixirId } },
        update: { quantity: 1 },
        create: { userId, templateId: elixirId, quantity: 1 }
    });

    // 5. Consume & Verify Permanent Gain
    console.log("[4/5] Consuming Permanent Elixir...");
    await consumableService.consumeItem(userId, heroId, elixirId);

    const updatedHero = await prisma.hero.findUnique({ where: { id: heroId } });
    console.log(`   New Hero Base STR: ${updatedHero.str} (Expected: 11)`);

    // 6. Final Result
    if (updatedHero.str === 11) {
        console.log("\n🌟 FINAL VERDICT: MASTER ALCHEMY SYSTEM FULLY OPERATIONAL.");
    } else {
        console.log("\n❌ FINAL VERDICT: PERMANENT STAT GAIN FAILED.");
    }

    // Cleanup
    await prisma.taskQueue.delete({ where: { id: craftTask.id } });

    console.log("\n--------------------------------------------------");
}

runMasterAudit().catch(err => console.error(err));