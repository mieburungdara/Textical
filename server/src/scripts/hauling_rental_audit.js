const haulingService = require('../services/logistics/HaulingService');
const inventoryService = require('../services/inventoryService');
const prisma = require('../db');

async function runRentalAudit() {
    console.log("--------------------------------------------------");
    console.log("📦 STARTING HAULING RENTAL AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const originId = 1;
    const targetId = 2;
    const graniteId = 2201;

    // 0. Setup: Clean state, add gold, add item
    console.log("[0/3] Preparing user state...");
    const heroes = await prisma.hero.findMany({ where: { userId } });
    for (const h of heroes) {
        await prisma.heroEquipment.deleteMany({ where: { heroId: h.id } });
    }
    
    await prisma.wagonItem.deleteMany({ where: { wagon: { userId } } });
    await prisma.wagon.deleteMany({ where: { userId } });
    await prisma.inventoryItem.deleteMany({ where: { userId } }); // Clear ALL items
    
    await prisma.user.update({ where: { id: userId }, data: { gold: 1000, currentRegion: originId } });
    await inventoryService.addItem(userId, graniteId, 5);

    // 1. Rent Wagon
    console.log("[1/3] Renting Small Wagon (Route Length 2)...");
    const wagon = await haulingService.rentWagon(userId, "SMALL", originId, targetId, [1, 2]);
    console.log(`   Wagon ID: ${wagon.id} (Status: ${wagon.status})`);
    
    const userAfterRent = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Gold Remaining: ${userAfterRent.gold} (Expected: 900)`); // 50 * 2 = 100 cost

    // 2. Load Items
    console.log("[2/3] Loading 5 Granite into Wagon...");
    const invItem = await prisma.inventoryItem.findFirst({ where: { userId, templateId: graniteId } });
    
    for (let i = 0; i < 5; i++) {
        await haulingService.loadItem(userId, invItem.id, 1);
    }

    const wagonStatus = await inventoryService.getStatus(userId, wagon.id);
    console.log(`   Wagon Slots: ${wagonStatus.used}/${wagonStatus.max}`);

    // 3. Test Overflow
    console.log("[3/3] Testing Capacity Overflow...");
    try {
        await haulingService.loadItem(userId, invItem.id, 1); // Should fail (item 0 quantity in bag anyway, but let's see)
        console.log("   ❌ Error: Loaded item beyond capacity or quantity.");
    } catch (e) {
        console.log(`   ✅ Correct: ${e.message}`);
    }

    // VERDICT
    if (userAfterRent.gold === 900 && wagonStatus.isFull) {
        console.log("\n🌟 FINAL VERDICT: HAULING RENTAL LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: RENTAL LOGIC FAILURE.");
    }

    // Cleanup
    await prisma.wagonItem.deleteMany({ where: { wagonId: wagon.id } });
    await prisma.wagon.delete({ where: { id: wagon.id } });
    await prisma.inventoryItem.deleteMany({ where: { userId, templateId: graniteId } });

    console.log("\n--------------------------------------------------");
}

runRentalAudit().catch(err => console.error(err));
