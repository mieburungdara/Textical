const craftingService = require('../services/craftingService');
const prisma = require('../db');

async function runLeatherAudit() {
    console.log("--------------------------------------------------");
    console.log("🧥 STARTING LEATHER TANNING (REFINING) AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 5603; // Tan Wolf Leather Recipe

    // 1. Setup Materials (4 Wolf Pelt)
    console.log("[1/4] Setting up materials (4x Wolf Pelt)...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2603 } }, // Wolf Pelt
        update: { quantity: 10 },
        create: { userId, templateId: 2603, quantity: 10 }
    });

    // 2. Learn Recipe
    console.log("[2/4] Learning tanning recipe...");
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId }
    });

    // 3. Attempt Tan
    console.log("[3/4] Attempting to start tanning...");
    try {
        const task = await craftingService.startCrafting(userId, recipeId);
        console.log(`   ✅ Success: Tanning task started. Task ID: ${task.id}`);

        // 4. Verify Material Deduction
        console.log("[4/4] Verifying materials...");
        const hide = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId, templateId: 2603 } } });

        console.log(`   Wolf Pelt remaining: ${hide.quantity} (Expected: 8)`);

        if (hide.quantity === 8) {
            console.log("\n✅ LEATHER TANNING AUDIT PASSED.");
        } else {
            console.log("\n❌ LEATHER TANNING AUDIT FAILED: Material mismatch.");
        }

        // Cleanup task
        await prisma.taskQueue.delete({ where: { id: task.id } });

    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    console.log("\n--------------------------------------------------");
}

runLeatherAudit().catch(err => console.error(err));
