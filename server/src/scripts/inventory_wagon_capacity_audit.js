const inventoryService = require('../services/inventoryService');
const prisma = require('../db');

async function runInventoryWagonAudit() {
    console.log("--------------------------------------------------");
    console.log("📦 STARTING INVENTORY WAGON CAPACITY AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const regionId = 1;
    const graniteId = 2201;

    // 0. Setup: Clean existing wagon
    console.log("[0/3] Preparing Small Cart (Capacity 5)...");
    await prisma.wagonItem.deleteMany({ where: { wagon: { userId } } });
    await prisma.wagon.deleteMany({ where: { userId } });
    
    const wagon = await prisma.wagon.create({
        data: {
            userId, tier: "SMALL", capacity: 5, status: "LOADING",
            originRegionId: regionId
        }
    });

    // 1. Test Capacity Check
    console.log("[1/3] Testing Wagon Capacity (Loading 5 items)...");
    const canAdd1 = await inventoryService.hasSpace(userId, graniteId, 1, wagon.id);
    console.log(`   Has Space for 1st item: ${canAdd1 ? 'YES' : 'NO'}`);

    // Fill wagon
    for (let i = 0; i < 5; i++) {
        await prisma.wagonItem.create({
            data: { wagonId: wagon.id, templateId: graniteId, quantity: 1 }
        });
    }

    const statusFull = await inventoryService.getStatus(userId, wagon.id);
    console.log(`   Wagon Slots: ${statusFull.used}/${statusFull.max} (IsFull: ${statusFull.isFull})`);

    // 2. Test Overflow
    console.log("[2/3] Attempting to add 6th item to Small Cart...");
    const canAdd6 = await inventoryService.hasSpace(userId, graniteId, 1, wagon.id);
    console.log(`   Has Space for 6th item: ${canAdd6 ? 'YES' : 'NO'} (Expected: NO)`);

    // VERDICT
    if (statusFull.isFull && !canAdd6) {
        console.log("\n🌟 FINAL VERDICT: WAGON CAPACITY SUPPORT PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: CAPACITY LOGIC FAILURE.");
    }

    // Cleanup
    await prisma.wagonItem.deleteMany({ where: { wagonId: wagon.id } });
    await prisma.wagon.delete({ where: { id: wagon.id } });

    console.log("\n--------------------------------------------------");
}

runInventoryWagonAudit().catch(err => console.error(err));
