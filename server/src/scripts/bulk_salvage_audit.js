const salvageService = require('../services/crafting/SalvageService');
const prisma = require('../db');

async function runBulkSalvageAudit() {
    console.log("--------------------------------------------------");
    console.log("♻️ STARTING BULK SALVAGE AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const swordTemplateId = 7001; // Iron Broadsword
    const ironIngotId = 2005;

    // 0. Setup: Ensure Recipe exists (10 Iron base)
    console.log("[0/3] Preparing environment...");
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    
    await prisma.recipeTemplate.upsert({
        where: { id: 1 },
        update: { resultItemId: swordTemplateId },
        create: { id: 1, name: "Bronze Sword Recipe", description: "Desc", resultItemId: swordTemplateId }
    });
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: 1 } });
    await prisma.recipeIngredient.create({
        data: { id: 1, recipeId: 1, itemId: ironIngotId, quantity: 10 }
    });

    // Create 3 Swords
    const items = [];
    for (let i = 0; i < 3; i++) {
        const item = await prisma.inventoryItem.create({
            data: { userId, templateId: swordTemplateId, quantity: 1 }
        });
        items.push(item);
    }

    console.log(`   Created 3 Iron Broadswords for salvage.`);

    // 1. Bulk Salvage
    console.log("[1/3] Executing Bulk Salvage (3 swords)...");
    const result = await salvageService.bulkSalvage(userId, items.map(i => i.id));
    
    // 2. Verify Result
    const salvagedCheck = await prisma.inventoryItem.findMany({ where: { id: { in: items.map(i => i.id) } } });
    const recovered = await prisma.inventoryItem.findFirst({ where: { userId, templateId: ironIngotId } });

    console.log(`   Items Deleted: ${salvagedCheck.length === 0 ? 'YES' : 'NO'}`);
    console.log(`   Recovered Materials: ${recovered ? recovered.quantity : 0} units (Expected: 9)`);
    // 3 swords * 10 iron * 30% = 9 iron

    // 3. Test Rarity Batch
    console.log("\n[2/3] Testing Rarity-Based Salvage (UNCOMMON)...");
    // Create 2 more swords
    await prisma.inventoryItem.create({ data: { userId, templateId: swordTemplateId, quantity: 1 } });
    await prisma.inventoryItem.create({ data: { userId, templateId: swordTemplateId, quantity: 1 } });
    
    const rarityResult = await salvageService.salvageByRarity(userId, "UNCOMMON");
    const ironFinal = await prisma.inventoryItem.findFirst({ where: { userId, templateId: ironIngotId } });

    console.log(`   Batch Count: ${rarityResult.count} items.`);
    console.log(`   Final Iron: ${ironFinal ? ironFinal.quantity : 0} units (Expected: 15)`);
    // 9 (from first) + (2 swords * 3 iron) = 15

    // VERDICT
    if (salvagedCheck.length === 0 && ironFinal && ironFinal.quantity === 15) {
        console.log("\n🌟 FINAL VERDICT: BULK SALVAGE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    // Cleanup
    await prisma.inventoryItem.deleteMany({ where: { userId } });

    console.log("\n--------------------------------------------------");
}

runBulkSalvageAudit().catch(err => console.error(err));
