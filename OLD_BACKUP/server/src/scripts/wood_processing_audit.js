const craftingService = require('../services/craftingService');
const prisma = require('../db');

async function runWoodAudit() {
    console.log("--------------------------------------------------");
    console.log("🪵 STARTING WOOD PROCESSING (PLANKS) AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 5501; // Process Oak Plank Recipe

    // 1. Setup Materials (4 Oak Wood)
    console.log("[1/4] Setting up materials (4x Oak Wood)...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2401 } }, // Oak Wood
        update: { quantity: 10 },
        create: { userId, templateId: 2401, quantity: 10 }
    });

    // 2. Learn Recipe
    console.log("[2/4] Learning processing recipe...");
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId }
    });

    // 3. Attempt Process
    console.log("[3/4] Attempting to start processing...");
    try {
        const task = await craftingService.startCrafting(userId, recipeId);
        console.log(`   ✅ Success: Processing task started. Task ID: ${task.id}`);

        // 4. Verify Material Deduction
        console.log("[4/4] Verifying materials...");
        const wood = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId, templateId: 2401 } } });

        console.log(`   Oak Wood remaining: ${wood.quantity} (Expected: 8)`);

        if (wood.quantity === 8) {
            console.log("\n✅ WOOD PROCESSING AUDIT PASSED.");
        } else {
            console.log("\n❌ WOOD PROCESSING AUDIT FAILED: Material mismatch.");
        }

        // Cleanup task
        await prisma.taskQueue.delete({ where: { id: task.id } });

    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    console.log("\n--------------------------------------------------");
}

runWoodAudit().catch(err => console.error(err));
