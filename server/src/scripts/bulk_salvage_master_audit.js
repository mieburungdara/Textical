const craftingService = require('../services/craftingService');
const salvageService = require('../services/crafting/SalvageService');
const prisma = require('../db');

async function runMasterBulkSalvageAudit() {
    console.log("--------------------------------------------------");
    console.log("♻️ STARTING BULK SALVAGE MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39;
    const recipeId = 1; // Iron Broadsword
    const ironId = 2005;

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });
    await prisma.user.update({ where: { id: userId }, data: { silver: 50000, currentRegion: 1, vitality: 100 } });
    
    // Ensure Hero exists
    await prisma.hero.upsert({
        where: { id: 39 },
        update: { unitLevel: 20, isMain: true },
        create: { id: 39, name: "Master Crafter", userId, unitLevel: 20, isMain: true, classId: 1001 }
    });

    // Provide materials for crafting 5 items (5 * 10 = 50 Iron)
    await prisma.inventoryItem.create({ data: { userId, templateId: ironId, quantity: 50 } });

    // 1. Craft 5 Items
    console.log("[1/4] Crafting 5 Iron Broadswords...");
    for (let i = 0; i < 5; i++) {
        const task = await craftingService.startCrafting(userId, recipeId);
        await craftingService.completeCrafting(userId, task.id);
    }
    
    const countAfterCraft = await prisma.inventoryItem.count({ where: { userId, templateId: 7001 } });
    console.log(`   Swords Created: ${countAfterCraft}.`);

    // 2. Initial Inventory State
    const ironBefore = (await prisma.inventoryItem.findFirst({ where: { userId, templateId: ironId } }))?.quantity || 0;
    console.log(`   Inventory before bulk salvage: ${ironBefore} Iron.`);

    // 3. Bulk Salvage All Gear
    console.log("\n[3/4] Bulk Salvaging all gear...");
    const gear = await prisma.inventoryItem.findMany({ 
        where: { userId, template: { category: { not: "MATERIAL" } } } 
    });
    
    await salvageService.bulkSalvage(userId, gear.map(g => g.id));

    // 4. Verify Recovery
    const gearCheck = await prisma.inventoryItem.count({ 
        where: { userId, template: { category: { not: "MATERIAL" } } } 
    });
    const ironAfter = (await prisma.inventoryItem.findFirst({ where: { userId, templateId: ironId } }))?.quantity || 0;
    
    console.log(`   Gear Remaining: ${gearCheck}`);
    console.log(`   Iron Recovered: ${ironAfter - ironBefore} units.`);
    // 5 swords * 3 iron = 15 recovery

    // VERDICT
    if (gearCheck === 0 && (ironAfter - ironBefore) >= 15) {
        console.log("\n🌟 FINAL VERDICT: BULK SALVAGE LIFECYCLE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LIFECYCLE FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterBulkSalvageAudit().catch(err => console.error(err));
