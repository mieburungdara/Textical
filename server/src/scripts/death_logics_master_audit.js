const battleService = require('../services/battleService');
const prisma = require('../db');

async function runMasterDeathAudit() {
    console.log("--------------------------------------------------");
    console.log("💀 STARTING DEATH LOGICS MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const monsterId = 6004;

    // Helper to setup a region
    const setupZone = async (regionId, type) => {
        await prisma.regionTemplate.update({ where: { id: regionId }, data: { zoneType: type } });
        await prisma.user.update({ where: { id: userId }, data: { currentRegion: regionId, vitality: 100, isKnockedOut: false, recoveryUntil: null } });
        await prisma.regionMonster.deleteMany({ where: { regionId, monsterId } });
        await prisma.regionMonster.create({ data: { regionId, monsterId } });
    };

    // Helper to create a hero
    const createHero = async (name, isMain) => {
        return await prisma.hero.create({
            data: { userId, name, isMain, classId: 1001, unitLevel: 1, hp_base: 1, vit: 1 }
        });
    };

    // 1. GREEN ZONE TEST
    console.log("[1/3] Testing Defeat in GREEN ZONE...");
    await setupZone(1, "GREEN");
    const greenHero = await createHero("SafeHero", false);
    
    const preset = await prisma.formationPreset.findFirst({ where: { userId } });
    await prisma.formationSlot.deleteMany({ where: { presetId: preset.id } });
    await prisma.formationSlot.create({ data: { presetId: preset.id, heroId: greenHero.id, gridX: 25, gridY: 40 } });

    await battleService.startBattle(userId, monsterId);
    
    const checkGreen = await prisma.hero.findUnique({ where: { id: greenHero.id } });
    const checkUserGreen = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Hero Exists: ${checkGreen ? 'YES' : 'NO'} (Expected: YES)`);
    console.log(`   Is KO: ${checkUserGreen.isKnockedOut ? 'YES' : 'NO'} (Expected: NO)`);

    // 2. BLUE ZONE TEST
    console.log("\n[2/3] Testing Defeat in BLUE ZONE...");
    await setupZone(3, "BLUE");
    await battleService.startBattle(userId, monsterId);
    const checkUserBlue = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Is KO: ${checkUserBlue.isKnockedOut ? 'YES' : 'NO'} (Expected: YES)`);

    // 3. RED ZONE TEST
    console.log("\n[3/3] Testing Defeat in RED ZONE...");
    await setupZone(5, "RED");
    const redHero = await createHero("DoomHero", false);
    await prisma.formationSlot.deleteMany({ where: { presetId: preset.id } });
    await prisma.formationSlot.create({ data: { presetId: preset.id, heroId: redHero.id, gridX: 25, gridY: 40 } });

    await battleService.startBattle(userId, monsterId);
    const checkRed = await prisma.hero.findUnique({ where: { id: redHero.id } });
    console.log(`   Hero Exists: ${checkRed ? 'YES' : 'NO'} (Expected: NO)`);

    // VERDICT
    if (checkGreen && !checkUserGreen.isKnockedOut && checkUserBlue.isKnockedOut && !checkRed) {
        console.log("\n🌟 FINAL VERDICT: DEATH LOGICS ZONALITY PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MASTER AUDIT FAILURE.");
    }

    // Cleanup
    await prisma.hero.deleteMany({ where: { name: "SafeHero" } });
    console.log("\n--------------------------------------------------");
}

runMasterDeathAudit().catch(err => console.error(err));
