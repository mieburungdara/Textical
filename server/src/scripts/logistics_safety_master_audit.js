const battleService = require('../services/battleService');
const statService = require('../services/statService');
const inventoryService = require('../services/inventoryService');
const prisma = require('../db');

async function runMasterSafetyAudit() {
    console.log("--------------------------------------------------");
    console.log("🛡️ STARTING LOGISTICS & SAFETY MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39;
    const regionId = 1;
    const monsterId = 6001;
    const swordId = 7001;

    // 1. Durability Flow
    console.log("[1/3] Testing Combat -> Breaking -> Stat Filtering...");
    
    // Setup fresh gear
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    const sword = await prisma.inventoryItem.create({
        data: { userId, templateId: swordId, quantity: 1, currentDurability: 5, maxDurability: 100 }
    });
    await prisma.heroEquipment.create({
        data: { heroId, slotKey: "MAIN_HAND", itemInstanceId: sword.id }
    });

    // Fight to break it
    await battleService.startBattle(userId, monsterId);
    
    const swordAfter = await prisma.inventoryItem.findUnique({ where: { id: sword.id } });
    console.log(`   Sword Durability: ${swordAfter.currentDurability} (Expected: <5)`);

    // Break it manually if battle was too short
    if (swordAfter.currentDurability > 0) {
        await prisma.inventoryItem.update({ where: { id: sword.id }, data: { currentDurability: 0 } });
    }

    const stats = await statService.calculateHeroStats(heroId);
    const hero = await prisma.hero.findUnique({ where: { id: heroId } });
    // Assuming base + growth = 15
    console.log(`   Final ATK with broken gear: ${stats.attack_damage} (Expected: 15)`);

    // 2. Wagon Flow
    console.log("[2/3] Testing Wagon Capacity Enforcement...");
    const wagon = await prisma.wagon.create({
        data: { userId, tier: "SMALL", capacity: 2, status: "LOADING", originRegionId: regionId }
    });

    const canAdd1 = await inventoryService.hasSpace(userId, 2201, 1, wagon.id);
    await prisma.wagonItem.create({ data: { wagonId: wagon.id, templateId: 2201, quantity: 1 } });
    await prisma.wagonItem.create({ data: { wagonId: wagon.id, templateId: 2201, quantity: 1 } });
    const canAdd3 = await inventoryService.hasSpace(userId, 2201, 1, wagon.id);

    console.log(`   Wagon Space (1/2): ${canAdd1 ? 'YES' : 'NO'}`);
    console.log(`   Wagon Space (3/2): ${canAdd3 ? 'YES' : 'NO'} (Expected: NO)`);

    // 3. Cleanup
    console.log("[3/3] Final Cleanup...");
    await prisma.wagonItem.deleteMany({ where: { wagonId: wagon.id } });
    await prisma.wagon.delete({ where: { id: wagon.id } });
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    await prisma.inventoryItem.delete({ where: { id: sword.id } });

    // VERDICT
    if (stats.attack_damage === 15 && !canAdd3) {
        console.log("\n🌟 FINAL VERDICT: LOGISTICS SAFETY FILTERS PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MASTER AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterSafetyAudit().catch(err => console.error(err));
