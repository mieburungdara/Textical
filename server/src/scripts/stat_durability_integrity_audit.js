const statService = require('../services/statService');
const prisma = require('../db');

async function runStatDurabilityAudit() {
    console.log("--------------------------------------------------");
    console.log("🛡️ STARTING STAT DURABILITY INTEGRITY AUDIT");
    console.log("--------------------------------------------------\n");

    const heroId = 39; // Arthur
    const swordTemplateId = 7001; // Iron Broadsword

    // 0. Setup: Hero with no gear first to get natural base
    console.log("[0/4] Establishing Natural Base (No Equipment)");
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    const naturalStats = await statService.calculateHeroStats(heroId);
    console.log(`   Natural ATK (Base + Growth): ${naturalStats.attack_damage}`);

    // 1. Equipping Broken Gear
    console.log("[1/4] Equipping broken sword...");
    const sword = await prisma.inventoryItem.create({
        data: {
            userId: 1, templateId: swordTemplateId, quantity: 1,
            currentDurability: 0, maxDurability: 100
        }
    });

    await prisma.heroEquipment.create({
        data: { heroId, slotKey: "MAIN_HAND", itemInstanceId: sword.id }
    });

    // 2. Calculate Stats
    console.log("[2/4] Calculating stats with broken gear...");
    const statsBroken = await statService.calculateHeroStats(heroId);
    console.log(`   Final ATK: ${statsBroken.attack_damage}`);

    // 3. Repair and Recalculate
    console.log("[3/4] Repairing gear and recalculating...");
    await prisma.inventoryItem.update({
        where: { id: sword.id },
        data: { currentDurability: 100 }
    });
    const statsRepaired = await statService.calculateHeroStats(heroId);
    console.log(`   Repaired ATK: ${statsRepaired.attack_damage}`);

    // VERDICT
    // statsBroken should equal naturalStats because broken gear is ignored
    const filterPass = statsBroken.attack_damage === naturalStats.attack_damage;
    const statsPass = statsRepaired.attack_damage > statsBroken.attack_damage;

    if (filterPass && statsPass) {
        console.log("\n🌟 FINAL VERDICT: STAT DURABILITY FILTERING PERFECT.");
    } else {
        console.log(`\n❌ FINAL VERDICT: FILTERING LOGIC FAILURE. Broken: ${statsBroken.attack_damage}, Natural: ${naturalStats.attack_damage}`);
    }

    // Cleanup
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    await prisma.inventoryItem.delete({ where: { id: sword.id } });

    console.log("\n--------------------------------------------------");
}

runStatDurabilityAudit().catch(err => console.error(err));