const statService = require('../services/statService');
const prisma = require('../db');

async function runBrokenStatAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING BROKEN ITEM STAT AUDIT");
    console.log("--------------------------------------------------\n");

    const heroId = 39;
    const templateId = 7001; // Iron Broadsword (15 ATK)

    // 0. Setup: Broken Item
    console.log("[0/2] Preparing broken item (0/100) ...");
    const item = await prisma.inventoryItem.create({
        data: { userId: 1, templateId, currentDurability: 0, maxDurability: 100 }
    });

    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    const baseStats = await statService.calculateHeroStats(heroId);

    // 1. Equip Broken Item
    console.log("[1/2] Equipping broken item...");
    await prisma.heroEquipment.create({
        data: { heroId, slotKey: "MAIN_HAND", itemInstanceId: item.id }
    });

    const finalStats = await statService.calculateHeroStats(heroId);
    console.log(`   Base ATK: ${baseStats.attack_damage}`);
    console.log(`   Equipped ATK: ${finalStats.attack_damage}`);

    // VERDICT
    if (finalStats.attack_damage === baseStats.attack_damage) {
        console.log("\n🌟 FINAL VERDICT: BROKEN ITEM PENALTY PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: STAT APPLICATION ON BROKEN ITEM.");
    }

    // Cleanup
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    await prisma.inventoryItem.deleteMany({ where: { id: item.id } });

    console.log("\n--------------------------------------------------");
}

runBrokenStatAudit().catch(err => console.error(err));
