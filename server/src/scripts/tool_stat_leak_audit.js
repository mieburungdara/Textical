const statService = require('../services/statService');
const prisma = require('../db');

async function auditLeak() {
    console.log("--------------------------------------------------");
    console.log("🧪 AUDITING TOOL STAT LEAK (BEFORE FIX)");
    console.log("--------------------------------------------------\n");

    const heroId = 999;
    const userId = 1;

    // 1. Ensure Hero exists with 10 STR
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { str: 10, userId: userId },
        create: { id: heroId, userId: userId, name: "AuditHero", classId: 1001, str: 10 }
    });

    // 2. Equip Iron Pickaxe (+10 STR)
    console.log("[1/2] Equipping Iron Pickaxe (+10 STR)...");
    const pickaxeInstance = await prisma.inventoryItem.findUnique({
        where: { userId_templateId: { userId, templateId: 2302 } }
    });
    
    await prisma.heroEquipment.upsert({
        where: { heroId_slotKey: { heroId, slotKey: "MAIN_HAND" } },
        update: { itemInstanceId: pickaxeInstance.id },
        create: { heroId, slotKey: "MAIN_HAND", itemInstanceId: pickaxeInstance.id }
    });

    // 3. Check Stats
    const stats = await statService.calculateHeroStats(heroId);
    console.log(`   Hero Base STR: 10`);
    console.log(`   Hero Current STR: ${stats.attributes.str}`);

    if (stats.attributes.str > 10) {
        console.log("\n⚠️  CONFIRMED: Tool stats are currently bleeding into general stats.");
    } else {
        console.log("\n✅ Tool stats are NOT being applied at all (StatService doesn't handle equipment yet).");
    }

    console.log("\n--------------------------------------------------");
}

auditLeak().catch(err => console.error(err));
