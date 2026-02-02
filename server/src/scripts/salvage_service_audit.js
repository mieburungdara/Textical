const salvageService = require('../services/crafting/SalvageService');
const prisma = require('../db');

async function runSalvageServiceAudit() {
    console.log("--------------------------------------------------");
    console.log("♻️ STARTING SALVAGE SERVICE AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const swordTemplateId = 7001;
    const ironIngotId = 2005;

    // 0. Setup: Ensure Item and Recipe exist
    console.log("[0/2] Preparing environment...");
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.recipeIngredient.deleteMany({ where: { recipe: { resultItemId: swordTemplateId } } });
    
    await prisma.recipeTemplate.upsert({
        where: { id: 1 },
        update: { resultItemId: swordTemplateId },
        create: { id: 1, name: "Bronze Sword Recipe", description: "Desc", resultItemId: swordTemplateId }
    });
    await prisma.recipeIngredient.create({
        data: { recipeId: 1, itemId: ironIngotId, quantity: 10 }
    });

    const item = await prisma.inventoryItem.create({
        data: { userId, templateId: swordTemplateId, quantity: 1 }
    });

    // 1. Salvage Item
    console.log("[1/2] Salvaging Bronze Sword (10 Iron base)...");
    const result = await salvageService.salvageItem(userId, item.id);
    
    // 2. Verify Result
    const salvagedCheck = await prisma.inventoryItem.findUnique({ where: { id: item.id } });
    const recovered = await prisma.inventoryItem.findFirst({ where: { userId, templateId: ironIngotId } });

    console.log(`   Item Deleted: ${salvagedCheck === null ? 'YES' : 'NO'}`);
    console.log(`   Recovered Materials: ${recovered ? recovered.quantity : 0} units (Expected: 3)`);

    // VERDICT
    if (salvagedCheck === null && recovered && recovered.quantity === 3) {
        console.log("\n🌟 FINAL VERDICT: SALVAGE SERVICE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SERVICE FAILURE.");
    }

    // Cleanup
    await prisma.inventoryItem.deleteMany({ where: { userId } });

    console.log("\n--------------------------------------------------");
}

runSalvageServiceAudit().catch(err => console.error(err));
