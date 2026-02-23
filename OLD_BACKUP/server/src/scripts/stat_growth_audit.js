const statService = require('../services/statService');
const prisma = require('../db');

async function runStressTest() {
    console.log("--------------------------------------------------");
    console.log("💎 STARTING END-GAME STAT STRESS TEST");
    console.log("--------------------------------------------------\n");

    const heroId = 999;

    const getStatsAtLvl100 = async (classId) => {
        await prisma.hero.update({ where: { id: heroId }, data: { level: 100, classId: classId } });
        return await statService.calculateHeroStats(heroId);
    };

    console.log("[1/2] Comparing Tier 2 vs Tier 3 (Level 100)");
    
    const knight = await getStatsAtLvl100(2101);
    console.log(`   Level 100 Knight (T2)         | HP: ${knight.health_max.toString().padStart(5)} | ATK: ${knight.attack_damage.toString().padStart(4)}`);

    const lord = await getStatsAtLvl100(3101);
    console.log(`   Level 100 Lord Commander (T3) | HP: ${lord.health_max.toString().padStart(5)} | ATK: ${lord.attack_damage.toString().padStart(4)}`);

    const hpDiff = lord.health_max - knight.health_max;
    const atkDiff = lord.attack_damage - knight.attack_damage;

    console.log(`\n   --- LEGENDARY GAP ---`);
    console.log(`   HP Bonus : +${hpDiff}`);
    console.log(`   ATK Bonus: +${atkDiff}`);

    if (hpDiff > 500 && atkDiff > 100) {
        console.log("\n✅ STRESS TEST PASSED: Tier 3 classes are truly Legendary.");
    } else {
        console.log("\n❌ STRESS TEST FAILED: Power gap is too small.");
    }
}

runStressTest().catch(err => console.error(err));