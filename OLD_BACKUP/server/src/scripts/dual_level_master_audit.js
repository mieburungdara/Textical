const progressionService = require('../services/progressionService');
const promotionService = require('../services/promotionService');
const statService = require('../services/statService');
const prisma = require('../db');

async function runDualLevelAudit() {
    console.log("--------------------------------------------------");
    console.log("🌟 STARTING DUAL-LEVEL ARCHITECTURE MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 1001;
    const warriorClassId = 1001;
    const knightClassId = 1101;

    // 1. Setup Hero (Base)
    console.log("[1/5] Initializing Hero (Unit Lv 1, Warrior Lv 1)...");
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { unitLevel: 1, unitXp: 0, classLevel: 1, classXp: 0, classId: warriorClassId, str: 10, dex: 10, int: 10, vit: 10 },
        create: { id: heroId, name: "Arthur", classId: warriorClassId, unitLevel: 1, classLevel: 1, str: 10, dex: 10, int: 10, vit: 10 }
    });

    // 2. Gain XP (Enough for Level 2)
    // Formula: BASE_XP * (Level^Exp) + (Linear * Level) -> Level 2 requires ~145 XP
    console.log("[2/5] Gaining 200 XP...");
    const res1 = await progressionService.addHeroExperience(heroId, 200);
    console.log(`   Unit Level: ${res1.hero.unitLevel} (Expected: 2)`);
    console.log(`   Class Level: ${res1.hero.classLevel} (Expected: 2)`);
    console.log(`   STR: ${res1.hero.str} (Expected: 12 - Boosted by Unit Level Up)`);

    // 3. Jump to Promotion Ready (Lv 20)
    console.log("[3/5] Setting Hero to Promotion Ready (Unit Lv 20, Class Lv 20)...");
    const lv20Xp = progressionService.getRequiredXP(20);
    await prisma.hero.update({
        where: { id: heroId },
        data: { unitLevel: 20, classLevel: 20, unitXp: lv20Xp, classXp: lv20Xp, str: 50 }
    });

    // 4. Promote to Knight
    console.log("[4/5] Promoting to Knight (Branching Evolution)...");
    const promoted = await promotionService.promoteHero(heroId, knightClassId);
    console.log(`   New Class: Knight`);
    console.log(`   Unit Level: ${promoted.unitLevel} (Expected: 20 - PRESERVED)`);
    console.log(`   Class Level: ${promoted.classLevel} (Expected: 1 - RESET)`);
    console.log(`   STR: ${promoted.str} (Expected: 55 - Boosted by Promotion Bonus)`);

    // 5. Check Mastery Table
    console.log("[5/5] Checking Class Mastery Records...");
    const mastery = await prisma.heroClassMastery.findUnique({
        where: { heroId_classId: { heroId, classId: warriorClassId } }
    });
    console.log(`   Warrior Mastery Level: ${mastery ? mastery.level : 'NONE'} (Expected: 20)`);

    // VERDICT
    if (promoted.unitLevel === 20 && promoted.classLevel === 1 && promoted.str === 55 && mastery.level === 20) {
        console.log("\n🌟 FINAL VERDICT: DUAL-LEVEL ARCHITECTURE FULLY OPERATIONAL.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC MISMATCH.");
    }

    console.log("\n--------------------------------------------------");
}

runDualLevelAudit().catch(err => console.error(err));
