const facilityService = require('../services/guild/GuildFacilityService');
const statService = require('../services/statService');
const prisma = require('../db');

async function runFacilityAudit() {
    console.log("--------------------------------------------------");
    console.log("🏗️ STARTING GUILD FACILITY MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const guildId = 1;
    const templateId = 1; // Armory
    const heroId = 39; // Arthur

    // 0. Setup: Clean Slate
    console.log("[0/5] Preparing environment (Guild, Templates, Treasury)...");
    await prisma.guildFacility.deleteMany({ where: { guildId } });
    
    await prisma.guildFacilityTemplate.upsert({
        where: { id: templateId },
        update: { statKey: "attack_damage", statValuePerLevel: 0.10, costBase: 1000 },
        create: { id: templateId, name: "Great Armory", description: "Boosts ATK", type: "STAT_BUFF", statKey: "attack_damage", statValuePerLevel: 0.10, costBase: 1000 }
    });

    // Ensure User 1 is in Guild 1
    await prisma.guild.update({ where: { id: guildId }, data: { treasury: 5000 } });
    await prisma.user.update({ where: { id: userId }, data: { guildId: guildId } });
    await prisma.hero.update({ where: { id: heroId }, data: { userId } });

    // 1. Base Stats
    const statsBefore = await statService.calculateHeroStats(heroId);
    console.log(`[1/5] Base Attack Damage: ${statsBefore.attack_damage}`);

    // 2. Build Armory (Level 1)
    console.log("[2/5] Building Level 1 Armory (+10% ATK)...");
    await facilityService.constructFacility(userId, guildId, templateId);
    
    const statsLevel1 = await statService.calculateHeroStats(heroId);
    console.log(`   New Attack Damage: ${statsLevel1.attack_damage} (Expected: ~${Math.floor(statsBefore.attack_damage * 1.1)})`);

    // 3. Upgrade to Level 2
    console.log("[3/5] Upgrading Armory to Level 2 (+20% ATK cumulative)...");
    const facility = await prisma.guildFacility.findUnique({ where: { guildId_templateId: { guildId, templateId } } });
    await facilityService.upgradeFacility(userId, guildId, facility.id);

    const statsLevel2 = await statService.calculateHeroStats(heroId);
    console.log(`   New Attack Damage: ${statsLevel2.attack_damage} (Expected: ~${Math.floor(statsBefore.attack_damage * 1.2)})`);

    // 4. Verify Treasury Deduction
    const finalGuild = await prisma.guild.findUnique({ where: { id: guildId } });
    console.log(`[4/5] Final Guild Treasury: ${finalGuild.treasury} (Expected: 5000 - 1000 - 1500 = 2500)`);

    // VERDICT
    const statPass = statsLevel2.attack_damage > statsLevel1.attack_damage && statsLevel1.attack_damage > statsBefore.attack_damage;
    const treasuryPass = finalGuild.treasury === 2500;

    if (statPass && treasuryPass) {
        console.log("\n🌟 FINAL VERDICT: GUILD FACILITY INFRASTRUCTURE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: FACILITY LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runFacilityAudit().catch(err => console.error(err));