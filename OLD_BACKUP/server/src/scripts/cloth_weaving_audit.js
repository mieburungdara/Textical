const craftingService = require('../services/craftingService');
const prisma = require('../db');

async function runClothAudit() {
    console.log("--------------------------------------------------");
    console.log("🧵 STARTING CLOTH WEAVING (REFINING) AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 5702; // Weave Blue Mana-Thread Recipe

    // 1. Setup Materials (4 Blue Blossom)
    console.log("[1/4] Setting up materials (4x Blue Blossom)...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2802 } }, // Blue Blossom
        update: { quantity: 10 },
        create: { userId, templateId: 2802, quantity: 10 }
    });

    // 2. Learn Recipe
    console.log("[2/4] Learning weaving recipe...");
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId }
    });

    // 3. Attempt Weave
    console.log("[3/4] Attempting to start weaving...");
    try {
        const task = await craftingService.startCrafting(userId, recipeId);
        console.log(`   ✅ Success: Weaving task started. Task ID: ${task.id}`);

        // 4. Verify Material Deduction
        console.log("[4/4] Verifying materials...");
        const herb = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId, templateId: 2802 } } });

        console.log(`   Blue Blossom remaining: ${herb.quantity} (Expected: 8)`);

        if (herb.quantity === 8) {
            console.log("\n✅ CLOTH WEAVING AUDIT PASSED.");
        } else {
            console.log("\n❌ CLOTH WEAVING AUDIT FAILED: Material mismatch.");
        }

        // Cleanup task
        await prisma.taskQueue.delete({ where: { id: task.id } });

    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    console.log("\n--------------------------------------------------");
}

runClothAudit().catch(err => console.error(err));
