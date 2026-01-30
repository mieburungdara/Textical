const statService = require('../services/statService');
const prisma = require('../db');

async function runAudit() {
    console.log("--------------------------------------------------");
    console.log("🛠️ STARTING CONTEXTUAL TOOL STAT AUDIT");
    console.log("--------------------------------------------------\n");

    const heroId = 999;
    const userId = 1;

    // 1. Setup Hero & Iron Pickaxe (+10 STR)
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { str: 10, userId: userId },
        create: { id: heroId, userId: userId, name: "ContextHero", classId: 1001, str: 10 }
    });

    const pickaxeInstance = await prisma.inventoryItem.findUnique({
        where: { userId_templateId: { userId, templateId: 2302 } }
    });
    
    await prisma.heroEquipment.upsert({
        where: { heroId_slotKey: { heroId, slotKey: "MAIN_HAND" } },
        update: { itemInstanceId: pickaxeInstance.id },
        create: { heroId, slotKey: "MAIN_HAND", itemInstanceId: pickaxeInstance.id }
    });

    console.log("Hero holding Iron Pickaxe (+10 STR). Base STR: 10.\n");

    // 2. Test GLOBAL Context (Combat/General)
    const statsGlobal = await statService.calculateHeroStats(heroId, "GLOBAL");
    console.log(`[1/3] Context: GLOBAL (Combat) -> Total STR: ${statsGlobal.attributes.str} (Expected: 10)`);

    // 3. Test MINING Context
    const statsMining = await statService.calculateHeroStats(heroId, "MINING");
    console.log(`[2/3] Context: MINING -> Total STR: ${statsMining.attributes.str} (Expected: 20)`);

    // 4. Test FISHING Context
    const statsFishing = await statService.calculateHeroStats(heroId, "FISHING");
    console.log(`[3/3] Context: FISHING -> Total STR: ${statsFishing.attributes.str} (Expected: 10)`);

    if (statsGlobal.attributes.str === 10 && statsMining.attributes.str === 20 && statsFishing.attributes.str === 10) {
        console.log("\n🌟 FINAL VERDICT: CONTEXTUAL STAT LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC MISMATCH.");
    }

    console.log("\n--------------------------------------------------");
}

runAudit().catch(err => console.error(err));
