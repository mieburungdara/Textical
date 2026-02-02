const battleService = require('../services/battleService');
const replayService = require('../services/battle/ReplayService');
const prisma = require('../db');

async function runIntegrationAudit() {
    console.log("--------------------------------------------------");
    console.log("🎬 STARTING BATTLE REPLAY INTEGRATION AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const monsterId = 6001; // Slime

    // 0. Setup: Ensure hero and formation
    console.log("[0/2] Preparing battle...");
    const hero = await prisma.hero.findFirst({ where: { userId } });
    if (!hero) {
        // Create temp hero if none
        const newHero = await prisma.hero.create({
            data: { userId, name: "ReplayTester", classId: 1001 }
        });
        const preset = await prisma.formationPreset.findFirst({ where: { userId } });
        await prisma.formationSlot.create({ data: { presetId: preset.id, heroId: newHero.id, gridX: 25, gridY: 40 } });
    }
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: 1, vitality: 100 } });
    
    // Ensure monster is available
    await prisma.regionMonster.deleteMany({ where: { regionId: 1, monsterId } });
    await prisma.regionMonster.create({
        data: { regionId: 1, monsterId }
    });

    // 1. Run Battle
    console.log("[1/2] Running battle...");
    const result = await battleService.startBattle(userId, monsterId);
    console.log(`   Battle ID: ${result.battleId}`);

    // 2. Check Replay
    console.log("[2/2] Verifying replay storage...");
    const replay = await replayService.getReplay(result.battleId);
    
    if (replay && replay.length > 0) {
        console.log(`   ✅ Replay found. Length: ${replay.length} ticks.`);
        console.log("\n🌟 FINAL VERDICT: BATTLE REPLAY INTEGRATION PERFECT.");
    } else {
        console.error("   ❌ Replay file missing or empty.");
    }

    // Cleanup (optional)
    console.log("\n--------------------------------------------------");
}

runIntegrationAudit().catch(err => console.error(err));
