const craftingService = require('../services/craftingService');
const prisma = require('../db');

async function runSmeltingAudit() {
    console.log("--------------------------------------------------");
    console.log("🔥 STARTING ORE SMELTING (REFINING) AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 5403; // Smelt Iron Bar Recipe

    // 1. Setup Materials (4 Iron Ore)
    console.log("[1/4] Setting up materials (4x Iron Ore)...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2203 } }, // Iron Ore
        update: { quantity: 10 },
        create: { userId, templateId: 2203, quantity: 10 }
    });

    // 2. Learn Recipe
    console.log("[2/4] Learning smelting recipe...");
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId }
    });

    // 3. Attempt Smelt
    console.log("[3/4] Attempting to start smelting...");
    try {
        const task = await craftingService.startCrafting(userId, recipeId);
        console.log(`   ✅ Success: Smelting task started. Task ID: ${task.id}`);

        // 4. Verify Material Deduction
        console.log("[4/4] Verifying materials...");
        const iron = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId, templateId: 2203 } } });

        console.log(`   Iron Ore remaining: ${iron.quantity} (Expected: 8)`);

        if (iron.quantity === 8) {
            console.log("\n✅ SMELTING AUDIT PASSED.");
        } else {
            console.log("\n❌ SMELTING AUDIT FAILED: Material mismatch.");
        }

        // Cleanup task
        await prisma.taskQueue.delete({ where: { id: task.id } });

    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    console.log("\n--------------------------------------------------");
}

runSmeltingAudit().catch(err => console.error(err));
