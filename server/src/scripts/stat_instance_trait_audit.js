const statService = require('../services/statService');
const prisma = require('../db');

async function runStatAffixAudit() {
    console.log("--------------------------------------------------");
    console.log("🛡️ STARTING STAT AFFIX INTEGRITY AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39; // Arthur
    const swordTemplateId = 7001;
    const traitId = 1; // FLAME_STRIKE (+5 ATK)

    // 0. Setup: Clean equipment and establish natural base
    console.log("[0/3] Establishing Natural Base (No Equipment)...");
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    const naturalStats = await statService.calculateHeroStats(heroId);
    console.log(`   Natural ATK: ${naturalStats.attack_damage}`);

    // 1. Equipping Item with Instance Trait
    console.log("[1/3] Creating and equipping magical sword (+5 ATK affix)...");
    
    // Ensure we know the template stat
    const templateStat = await prisma.itemStat.findFirst({ where: { itemId: swordTemplateId, statKey: "attack_damage" } });
    const templateVal = templateStat ? templateStat.statValue : 0;
    console.log(`   Template Base ATK: ${templateVal}`);

    const sword = await prisma.inventoryItem.create({
        data: {
            userId, templateId: swordTemplateId, quantity: 1,
            instanceTraits: {
                create: { traitId: traitId }
            }
        }
    });

    await prisma.heroEquipment.create({
        data: { heroId, slotKey: "MAIN_HAND", itemInstanceId: sword.id }
    });

    // 2. Calculate Stats
    console.log("[2/3] Calculating stats with magical affix...");
    const statsMagical = await statService.calculateHeroStats(heroId);
    console.log(`   Final ATK: ${statsMagical.attack_damage}`);

    // 3. Verify
    const diff = statsMagical.attack_damage - naturalStats.attack_damage;
    const expectedDiff = templateVal + 5;
    console.log(`   Stat Boost Detected: ${diff} (Expected: ${expectedDiff})`);

    // VERDICT
    if (diff === expectedDiff) {
        console.log("\n🌟 FINAL VERDICT: STAT AFFIX AGGREGATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: STAT LOGIC FAILURE.");
    }

    // Cleanup
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    await prisma.itemInstanceTrait.deleteMany({ where: { itemInstanceId: sword.id } });
    await prisma.inventoryItem.delete({ where: { id: sword.id } });

    console.log("\n--------------------------------------------------");
}

runStatAffixAudit().catch(err => console.error(err));