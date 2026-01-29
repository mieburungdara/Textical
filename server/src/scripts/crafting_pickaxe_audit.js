const craftingService = require('../services/craftingService');
const prisma = require('../db');

async function runCraftingAudit() {
    console.log("--------------------------------------------------");
    console.log("⚒️ STARTING PICKAXE CRAFTING AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 5002; // Iron Pickaxe Recipe

    // Ensure User 1 exists
    await prisma.user.upsert({
        where: { id: userId },
        update: { currentRegion: 1 },
        create: { id: userId, username: "CraftTest", password: "password", currentRegion: 1, premiumTierId: 0 }
    });

    // Ensure Region 1 is a TOWN for crafting
    await prisma.regionTemplate.upsert({
        where: { id: 1 },
        update: { visualType: "TOWN" },
        create: { id: 1, name: "Test Town", description: "Audit Town", visualType: "TOWN" }
    });

    // 1. Setup Materials (3 Iron Ore, 2 Oak Wood)
    console.log("[1/4] Setting up materials...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2203 } }, // Iron Ore
        update: { quantity: 10 },
        create: { userId, templateId: 2203, quantity: 10 }
    });
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2200 } }, // Oak Wood
        update: { quantity: 10 },
        create: { userId, templateId: 2200, quantity: 10 }
    });

    // 2. Learn Recipe
    console.log("[2/4] Learning recipe...");
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId }
    });

    // 3. Attempt Craft
    console.log("[3/4] Attempting to start craft...");
    try {
        const task = await craftingService.startCrafting(userId, recipeId);
        console.log(`   ✅ Success: Crafting task started. Task ID: ${task.id}`);

        // 4. Verify Material Deduction
        console.log("[4/4] Verifying materials...");
        const iron = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId, templateId: 2203 } } });
        const wood = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId, templateId: 2200 } } });

        console.log(`   Iron Ore remaining: ${iron.quantity} (Expected: 7)`);
        console.log(`   Oak Wood remaining: ${wood.quantity} (Expected: 8)`);

        if (iron.quantity === 7 && wood.quantity === 8) {
            console.log("\n✅ CRAFTING AUDIT PASSED.");
        } else {
            console.log("\n❌ CRAFTING AUDIT FAILED: Material mismatch.");
        }

        // Cleanup task
        await prisma.taskQueue.delete({ where: { id: task.id } });

    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    console.log("\n--------------------------------------------------");
}

runCraftingAudit().catch(err => console.error(err));