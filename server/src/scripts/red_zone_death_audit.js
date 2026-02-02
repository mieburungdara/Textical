const battleService = require('../services/battleService');
const prisma = require('../db');

async function runRedZoneDeathAudit() {
    console.log("--------------------------------------------------");
    console.log("💀 STARTING RED ZONE DEATH INTEGRITY AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const regionId = 5; // Forbidden Grove (RED)
    const monsterId = 6004; // Wild Boar (Strong)

    // 0. Setup: One Main Hero, One Kroco Hero
    console.log("[0/4] Preparing heroes in Red Zone...");
    
    // Clear formation
    const preset = await prisma.formationPreset.findFirst({ where: { userId } });
    await prisma.formationSlot.deleteMany({ where: { presetId: preset.id } });

    // Create Main Hero
    const mainHero = await prisma.hero.create({
        data: {
            userId, name: "Arthur (Main)", isMain: true, classId: 1001, unitLevel: 5, unitXp: 1000, 
            hp_base: 5, damage_base: 0
        }
    });

    // Create Kroco Hero
    const krocoHero = await prisma.hero.create({
        data: {
            userId, name: "Redshirt", isMain: false, classId: 1001, unitLevel: 1, unitXp: 100, 
            hp_base: 5, damage_base: 0
        }
    });

    // Equit gear to Main
    const sword = await prisma.inventoryItem.create({
        data: { userId, templateId: 7001, quantity: 1 }
    });
    await prisma.heroEquipment.create({
        data: { heroId: mainHero.id, slotKey: "MAIN_HAND", itemInstanceId: sword.id }
    });

    // Set to formation
    await prisma.formationSlot.create({ data: { presetId: preset.id, heroId: mainHero.id, gridX: 25, gridY: 40 } });
    await prisma.formationSlot.create({ data: { presetId: preset.id, heroId: krocoHero.id, gridX: 26, gridY: 40 } });

    // Ensure region is RED
    await prisma.regionTemplate.update({ where: { id: regionId }, data: { zoneType: "RED" } });
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: regionId, vitality: 100 } });

    // Ensure monster is GOD-LIKE
    await prisma.monsterTemplate.update({
        where: { id: monsterId },
        data: { hp_base: 10000, damage_base: 1000 }
    });
    await prisma.regionMonster.deleteMany({ where: { regionId, monsterId } });
    await prisma.regionMonster.create({ data: { regionId, monsterId } });

    // 1. Simulate Defeat
    console.log("[1/4] Simulating absolute defeat in Red Zone...");
    const res = await battleService.startBattle(userId, monsterId);
    console.log("--- BATTLE LOGS (Last 10 Ticks) ---");
    res.replay.slice(-10).forEach(l => {
        if (l.events.length > 0) {
            console.log(`   [Tick ${l.tick}] ${l.events.map(e => `[${e.type}] ${e.msg}`).join(' | ')}`);
        }
    });
    console.log("-------------------");

    // 2. Check Consequences
    console.log("[2/4] Verifying consequences...");
    
    const finalKroco = await prisma.hero.findUnique({ where: { id: krocoHero.id } });
    const finalMain = await prisma.hero.findUnique({ where: { id: mainHero.id } });
    const finalEquip = await prisma.heroEquipment.findMany({ where: { heroId: mainHero.id } });

    console.log(`   Kroco Hero Exists: ${finalKroco ? 'YES' : 'NO'} (Expected: NO)`);
    console.log(`   Main Hero Exists: ${finalMain ? 'YES' : 'NO'} (Expected: YES)`);
    if (finalMain) {
        console.log(`   Main Hero Equipment Count: ${finalEquip.length} (Expected: 0)`);
        console.log(`   Main Hero XP: ${finalMain.unitXp} (Initial: 1000, Expected: 900)`);
    }

    // VERDICT
    const permadeathPass = !finalKroco;
    const immortalityPass = finalMain && finalEquip.length === 0 && finalMain.unitXp === 900;

    if (permadeathPass && immortalityPass) {
        console.log("\n🌟 FINAL VERDICT: RED ZONE PERMADEATH & NAKED IMMORTALITY PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: DEATH LOGIC FAILURE.");
    }

    // Reset Monster
    await prisma.monsterTemplate.update({
        where: { id: monsterId },
        data: { hp_base: 120, damage_base: 15 }
    });

    // Cleanup
    if (finalMain) {
        await prisma.heroEquipment.deleteMany({ where: { heroId: mainHero.id } });
        await prisma.formationSlot.deleteMany({ where: { heroId: mainHero.id } });
        await prisma.hero.delete({ where: { id: mainHero.id } });
    }
    await prisma.inventoryItem.deleteMany({ where: { id: sword.id } });

    console.log("\n--------------------------------------------------");
}

runRedZoneDeathAudit().catch(err => console.error(err));