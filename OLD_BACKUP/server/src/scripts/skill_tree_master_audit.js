const progressionService = require('../services/progressionService');
const statService = require('../services/statService');
const prisma = require('../db');

async function runSkillTreeAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING UNIQUE CLASS SKILL TREE MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 1002;
    const noviceClassId = 1001;

    // 1. Setup Hero: Novice Level 1
    console.log("[1/5] Initializing Hero (Novice Lv 1)...");
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { unitLevel: 1, classId: noviceClassId, classLevel: 1, classXp: 0, str: 10, dex: 10, int: 10, vit: 10 },
        create: { id: heroId, name: "Trainee", classId: noviceClassId, classLevel: 1, classXp: 0, str: 10, dex: 10, int: 10, vit: 10 }
    });
    await prisma.heroSkill.deleteMany({ where: { heroId } });

    // 2. Gain XP
    console.log("[2/5] Gaining 1500 XP...");
    const res1 = await progressionService.addHeroExperience(heroId, 1500);
    console.log(`   New Unit Level: ${res1.hero.unitLevel}`);
    console.log(`   New Class Level: ${res1.hero.classLevel}`);
    console.log(`   Skills Unlocked: ${res1.unlockedSkills.join(', ')}`);

    // 3. Verify Passive Buff Application via StatService
    console.log("[3/5] Verifying 'Hardy' Passive (+50 Max HP)...");
    const buffed = await statService.calculateHeroStats(heroId);
    
    /**
     * DYNAMIC CALCULATION:
     * Base: 100
     * VIT Scaling: VIT * 10
     * Passive: +50
     * Class Growth (Novice): 5 * (ClassLevel - 1)
     */
    const expectedHP = 100 + (res1.hero.vit * 10) + 50 + (5 * (res1.hero.classLevel - 1));
    console.log(`   Expected Max HP: ${expectedHP}`);
    console.log(`   Actual Max HP: ${buffed.health_max}`);

    // 4. Final Verdict
    if (res1.unlockedSkills.includes("Hardy") && buffed.health_max === expectedHP) {
        console.log("\n🌟 FINAL VERDICT: CLASS SKILL TREE SYSTEM FULLY OPERATIONAL.");
    } else {
        console.log(`\n❌ FINAL VERDICT: AUDIT FAILURE.`);
    }

    console.log("\n--------------------------------------------------");
}

runSkillTreeAudit().catch(err => console.error(err));
