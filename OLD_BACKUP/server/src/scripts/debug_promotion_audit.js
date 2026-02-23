const promotionService = require('../services/promotionService');
const prisma = require('../db');

async function runPromotionAudit() {
    console.log("--------------------------------------------------");
    console.log("🎖️ STARTING PROMOTION MODULAR AUDIT");
    console.log("--------------------------------------------------\n");

    const heroId = 999;

    console.log("[1/3] Preparing Novice (Level 5)... ");
    await prisma.hero.update({
        where: { id: heroId },
        data: { classId: 1001, level: 5 } // 1001 = Novice
    });

    console.log("[2/3] Testing Premature Promotion (Req: 10)...");
    try {
        await promotionService.promoteHero(heroId, 2001); // 2001 = Warrior
        console.log("   ❌ Error: Promotion should have failed.");
    } catch (e) {
        console.log(`   ✅ Success: Promotion blocked correctly (${e.message})`);
    }

    console.log("\n[3/3] Testing Valid Promotion (Level 10)...");
    await prisma.hero.update({ where: { id: heroId }, data: { level: 10 } });
    const promoted = await promotionService.promoteHero(heroId, 2001);
    console.log(`   Hero Identity: ${promoted.name} | New Class: ${promoted.combatClass.name}`);

    if (promoted.classId === 2001) {
        console.log("\n✅ PROMOTION AUDIT PASSED: Progression tree is logic-locked.");
    } else {
        console.log("\n❌ PROMOTION AUDIT FAILED.");
    }
}

runPromotionAudit().catch(err => console.error(err));
