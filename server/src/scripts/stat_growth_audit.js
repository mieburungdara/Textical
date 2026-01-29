const statService = require('../services/statService');
const prisma = require('../db');

async function runGrowthAudit() {
    console.log("--------------------------------------------------");
    console.log("📈 STARTING STAT GROWTH MODULAR AUDIT");
    console.log("--------------------------------------------------\n");

    const heroId = 999; 

    console.log("[0/2] Ensuring Test Hero Exists...");
    await prisma.hero.upsert({
        where: { id: heroId },
        update: {},
        create: {
            id: heroId,
            name: "Progression Dummy",
            classId: 3001, // Knight
            hp_base: 100,
            damage_base: 10
        }
    });

    const testGrowth = async (level) => {
        await prisma.hero.update({ where: { id: heroId }, data: { level: level } });
        const stats = await statService.calculateHeroStats(heroId);
        console.log(`   Level ${level.toString().padEnd(2)} Knight | HP: ${stats.health_max.toString().padStart(4)} | ATK: ${stats.attack_damage.toString().padStart(3)}`);
        return stats;
    };

    console.log("[1/2] Comparing Levels...");
    const s1 = await testGrowth(1);
    const s20 = await testGrowth(20);
    const s50 = await testGrowth(50);

    console.log("\n[2/2] Growth Verification...");
    const hpGain = s20.health_max - s1.health_max;
    console.log(`   HP Gain (Lvl 1 -> 20): ${hpGain} (Expected: 475)`);

    if (hpGain === 475) {
        console.log("\n✅ STAT GROWTH AUDIT PASSED: Progression is mathematically perfect.");
    } else {
        console.log("\n❌ STAT GROWTH AUDIT FAILED.");
    }
}

runGrowthAudit().catch(err => console.error(err));