const promotionService = require('../services/promotionService');
const prisma = require('../db');

async function runPromotionAudit() {
    console.log("--------------------------------------------------");
    console.log("🛡️ STARTING CLASS PROMOTION FULL-CYCLE AUDIT");
    console.log("--------------------------------------------------\n");

    const heroId = 1000;
    const warriorClassId = 1001;
    const knightClassId = 1101;
    const assassinClassId = 1104;

    // 1. Setup Hero: Level 20 Warrior
    console.log("[1/4] Setting up Level 20 Warrior (Stats: 10/10/10/10)...");
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { classId: warriorClassId, level: 20, str: 10, dex: 10, int: 10, vit: 10 },
        create: { id: heroId, name: "Arthur", classId: warriorClassId, level: 20, str: 10, dex: 10, int: 10, vit: 10 }
    });

    // 2. Test Invalid Branch
    console.log("[2/4] Testing Invalid Branch: Warrior -> Assassin...");
    try {
        await promotionService.promoteHero(heroId, assassinClassId);
        console.log("   ❌ Error: Should have failed invalid branch check.");
    } catch (e) {
        console.log(`   ✅ Caught Expected Error: ${e.message}`);
    }

    // 3. Test Valid Branch (Knight)
    console.log("[3/4] Testing Valid Branch: Warrior -> Knight...");
    const promotedHero = await promotionService.promoteHero(heroId, knightClassId);
    
    console.log(`   New Class ID: ${promotedHero.classId} (Expected: 1101)`);
    console.log(`   New Level: ${promotedHero.level} (Expected: 1)`);
    console.log(`   New STR: ${promotedHero.str} (Expected: 15)`);

    // 4. Final Verdict
    if (promotedHero.classId === knightClassId && promotedHero.level === 1 && promotedHero.str === 15) {
        console.log("\n🌟 FINAL VERDICT: CLASS PROMOTION SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: PROMOTION LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runPromotionAudit().catch(err => console.error(err));
