const gatheringService = require('../services/gatheringService');
const craftingService = require('../services/craftingService');
const prisma = require('../db');

async function runHerbalismAudit() {
    console.log("--------------------------------------------------");
    console.log("🌿 STARTING HERBALISM & ALCHEMY AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 998; 

    // 1. Setup Hero with high INT
    console.log("[1/4] Setting up hero (INT: 40)...");
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { int: 40, userId: userId },
        create: { id: heroId, userId: userId, name: "Alchemist", classId: 1001, int: 40 }
    });

    // 2. Test Foraging (Blue Blossom - Base 8s)
    const resource = await prisma.regionResource.findFirst({
        where: { regionId: 1, itemId: 2802 }, // Blue Blossom
        include: { item: true }
    });

    console.log(`[2/4] Attempting to forage ${resource.item.name}...`);
    try {
        const gatherTask = await gatheringService.startGathering(userId, heroId, resource.id);
        const duration = (gatherTask.finishesAt - gatherTask.startedAt) / 1000;
        
        console.log(`   ✅ Success: Foraging started.`);
        console.log(`   Duration: ${duration}s (Base: 8s, INT Factor: 4.0)`);

        if (duration === 2) { // 8 / (40/10) = 2
            console.log("   🌟 FORAGING LOGIC: PERFECT.");
        } else {
            console.log("   ❌ FORAGING LOGIC: MISMATCH.");
        }
        await prisma.taskQueue.delete({ where: { id: gatherTask.id } });
    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    // 3. Setup Potion Ingredients (3 Blue Blossom, 1 Bat Membrane)
    console.log("\n[3/4] Setting up alchemy ingredients...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2802 } },
        update: { quantity: 10 },
        create: { userId, templateId: 2802, quantity: 10 }
    });
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2605 } },
        update: { quantity: 10 },
        create: { userId, templateId: 2605, quantity: 10 }
    });

    // 4. Test Potion Crafting (Mana Potion)
    console.log("[4/4] Attempting to brew Mana Potion...");
    const recipeId = 5302;
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId }
    });

    try {
        const craftTask = await craftingService.startCrafting(userId, recipeId);
        console.log(`   ✅ Success: Brewing started. Task ID: ${craftTask.id}`);
        
        // Verify deduction
        const blossom = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId, templateId: 2802 } } });
        console.log(`   Blue Blossom remaining: ${blossom.quantity} (Expected: 7)`);
        
        if (blossom.quantity === 7) {
            console.log("\n🌟 FINAL VERDICT: HERBALISM & ALCHEMY FULLY OPERATIONAL.");
        } else {
            console.log("\n❌ FINAL VERDICT: MATERIAL DEDUCTION FAILED.");
        }

        await prisma.taskQueue.delete({ where: { id: craftTask.id } });
    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    console.log("\n--------------------------------------------------");
}

runHerbalismAudit().catch(err => console.error(err));
