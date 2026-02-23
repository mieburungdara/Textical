const statService = require('../services/statService');
const repairService = require('../services/economy/RepairService');
const prisma = require('../db');

async function runMasterRepairAudit() {
    console.log("--------------------------------------------------");
    console.log("🛠️ STARTING REPAIR SYSTEM MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39;
    const templateId = 7001; // Iron Broadsword (15 ATK)

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    await prisma.user.update({ where: { id: userId }, data: { silver: 10000, currentRegion: 1 } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.heroEquipment.deleteMany({ where: { heroId } });

    const item = await prisma.inventoryItem.create({
        data: { userId, templateId, currentDurability: 100, maxDurability: 100 }
    });

    await prisma.heroEquipment.create({
        data: { heroId, slotKey: "MAIN_HAND", itemInstanceId: item.id }
    });

    // 1. Initial Stats (Functional Item)
    const stats1 = await statService.calculateHeroStats(heroId);
    console.log(`[1/4] Stats with NEW item: ATK=${stats1.attack_damage}`);

    // 2. Break Item
    console.log("\n[2/4] Breaking the item (Durability 0)...");
    await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { currentDurability: 0 }
    });

    const stats2 = await statService.calculateHeroStats(heroId);
    console.log(`   Stats with BROKEN item: ATK=${stats2.attack_damage} (Expected < ${stats1.attack_damage})`);

    // 3. Repair Item
    console.log("\n[3/4] Repairing the item...");
    await repairService.repairItem(userId, item.id);

    const stats3 = await statService.calculateHeroStats(heroId);
    console.log(`   Stats after REPAIR: ATK=${stats3.attack_damage} (Expected: ${stats1.attack_damage})`);

    // 4. Verify Silver Sink
    const finalUser = await prisma.user.findUnique({ where: { id: userId } });
    const silverSpent = 10000 - finalUser.silver;
    console.log(`\n[4/4] Silver spent on repair: ${silverSpent} Silver.`);

    // VERDICT
    const penaltyPass = stats2.attack_damage < stats1.attack_damage;
    const restorePass = stats3.attack_damage === stats1.attack_damage;
    const sinkPass = silverSpent > 0;

    if (penaltyPass && restorePass && sinkPass) {
        console.log("\n🌟 FINAL VERDICT: REPAIR SYSTEM ARCHITECTURE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: REPAIR SYSTEM FAILURE.");
    }

    // Cleanup
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });

    console.log("\n--------------------------------------------------");
}

runMasterRepairAudit().catch(err => console.error(err));
