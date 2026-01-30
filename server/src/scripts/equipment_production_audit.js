const craftingService = require('../services/craftingService');
const prisma = require('../db');

async function runEquipmentAudit() {
    console.log("--------------------------------------------------");
    console.log("⚒️ STARTING EQUIPMENT PRODUCTION AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const swordRecipeId = 8001; // Iron Broadsword Recipe
    
    // 0. Ensure user has space and is in town
    await prisma.user.update({ where: { id: userId }, data: { maxInventorySlots: 100, currentRegion: 1 } });
    await prisma.regionTemplate.update({ where: { id: 1 }, data: { visualType: "TOWN" } });

    // 1. Setup Ingredients: 3x Iron Bar (2703), 1x Oak Plank (2901)
    console.log("[1/3] Setting up refined ingredients...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2703 } },
        update: { quantity: 10 },
        create: { userId, templateId: 2703, quantity: 10 }
    });
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2901 } },
        update: { quantity: 10 },
        create: { userId, templateId: 2901, quantity: 10 }
    });

    // 2. Start Crafting
    console.log("[2/3] Starting Forge: Iron Broadsword...");
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId: swordRecipeId } },
        update: {},
        create: { userId, recipeId: swordRecipeId }
    });

    const craftTask = await craftingService.startCrafting(userId, swordRecipeId);
    console.log(`   ✅ Success: Forge started. Task ID: ${craftTask.id}`);

    // 3. Verify Stat Mappings on Result Item
    console.log("[3/3] Verifying stat mappings on target item (7001)...");
    const sword = await prisma.itemTemplate.findUnique({
        where: { id: 7001 },
        include: { stats: true }
    });

    const atkStat = sword.stats.find(s => s.statKey === "attack_damage");
    console.log(`   Item: ${sword.name}`);
    console.log(`   Stat: attack_damage = ${atkStat ? atkStat.statValue : 'MISSING'}`);

    // 4. Result
    if (craftTask && atkStat && atkStat.statValue === 15) {
        console.log("\n🌟 FINAL VERDICT: EQUIPMENT PRODUCTION SYSTEM FULLY OPERATIONAL.");
    } else {
        console.log("\n❌ FINAL VERDICT: PRODUCTION AUDIT FAILED.");
    }

    // Cleanup
    await prisma.taskQueue.delete({ where: { id: craftTask.id } });

    console.log("\n--------------------------------------------------");
}

runEquipmentAudit().catch(err => console.error(err));
