const craftingService = require('../services/craftingService');
const salvageService = require('../services/crafting/SalvageService');
const prisma = require('../db');

async function runMasterSinkAudit() {
    console.log("--------------------------------------------------");
    console.log("♻️ STARTING ITEM SINK MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 1; // Bronze Sword
    const ironId = 2005;

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });
    await prisma.user.update({ where: { id: userId }, data: { silver: 10000, currentRegion: 1, energy: 100 } });
    
    // Ensure Hero exists
    await prisma.hero.upsert({
        where: { id: 39 },
        update: { unitLevel: 10, isMain: true },
        create: { id: 39, name: "Crafter", userId, unitLevel: 10, isMain: true, classId: 1001 }
    });

    // Provide materials for crafting (Need 3 Iron for Recipe 1)
    await prisma.inventoryItem.create({ data: { userId, templateId: ironId, quantity: 10 } });

    // 1. Craft Item
    console.log("[1/4] Crafting Bronze Sword...");
    const task = await craftingService.startCrafting(userId, recipeId);
    await craftingService.completeCrafting(userId, task.id);
    
    const sword = await prisma.inventoryItem.findFirst({ where: { userId, templateId: 7001 } });
    console.log(`   Sword Created: ${sword.quality} quality.`);

    // 2. Initial Inventory Count
    const countBefore = await prisma.inventoryItem.count({ where: { userId } });
    const ironItemBefore = await prisma.inventoryItem.findFirst({ where: { userId, templateId: ironId } });
    const ironBefore = ironItemBefore ? ironItemBefore.quantity : 0;
    console.log(`   Inventory before salvage: ${countBefore} slots, ${ironBefore} Iron.`);

    // 3. Salvage Item
    console.log("\n[3/4] Salvaging the Sword...");
    await salvageService.salvageItem(userId, sword.id);

    // 4. Verify Recovery
    const swordCheck = await prisma.inventoryItem.findUnique({ where: { id: sword.id } });
    const ironItemAfter = await prisma.inventoryItem.findFirst({ where: { userId, templateId: ironId } });
    const ironAfter = ironItemAfter ? ironItemAfter.quantity : 0;
    
    console.log(`   Sword Deleted: ${swordCheck === null ? 'YES' : 'NO'}`);
    console.log(`   Iron Recovered: ${ironAfter - ironBefore} units.`);

    // VERDICT
    if (swordCheck === null && ironAfter > ironBefore) {
        console.log("\n🌟 FINAL VERDICT: ITEM SINK LIFECYCLE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LIFECYCLE FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterSinkAudit().catch(err => console.error(err));
