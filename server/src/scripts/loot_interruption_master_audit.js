const battleService = require('../services/battleService');
const lootService = require('../services/logistics/LootService');
const rewardProcessor = require('../services/battle/RewardProcessor');
const prisma = require('../db');

async function runMasterLootAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING LOOT INTERRUPTION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const victimA = 1;
    const winnerB = 2;
    const attackerC = 1; // For simulation, let's say victim A respawns and attacks back
    const monsterId = 6001;

    // 1. Initial State: Victim A has a Wagon
    console.log("[1/4] Preparing Victim A with Wagon...");
    await prisma.wagonItem.deleteMany({ where: { wagon: { userId: victimA } } });
    await prisma.wagon.deleteMany({ where: { userId: victimA } });
    await prisma.lootSession.deleteMany({});

    const wagon = await prisma.wagon.create({
        data: {
            userId: victimA, tier: "SMALL", capacity: 5, status: "EN_ROUTE",
            items: { create: { templateId: 2201, quantity: 5 } }
        }
    });

    // 2. Victory: Winner B defeats A
    console.log("[2/4] Winner B defeats A -> Creating Loot Session...");
    const mockResult = { winner: 0, rewards: { gold: 50, exp: 100 }, initialUnits: [] };
    const mockMonster = { id: monsterId, loot: [] };
    await rewardProcessor.process(winnerB, { ...mockResult, victimUserId: victimA }, mockMonster, 1);

    const session = await lootService.getActiveSession(winnerB);
    console.log(`   Loot Session Active for B: ${session ? 'YES' : 'NO'}`);

    // 3. Interruption: C attacks B
    console.log("[3/4] Attacker C (Third Party) attacks Winner B...");
    // Ensure Winner B has a formation
    let presetB = await prisma.formationPreset.findFirst({ where: { userId: winnerB } });
    if (!presetB) {
        presetB = await prisma.formationPreset.create({ data: { userId: winnerB, name: "Default" } });
    }
    
    // Ensure Winner B has a hero in that formation
    let heroB = await prisma.hero.findFirst({ where: { userId: winnerB } });
    if (!heroB) {
        heroB = await prisma.hero.create({ data: { userId: winnerB, name: "Warrior B", classId: 1001 } });
    }
    await prisma.formationSlot.deleteMany({ where: { presetId: presetB.id } });
    await prisma.formationSlot.create({ data: { presetId: presetB.id, heroId: heroB.id, gridX: 25, gridY: 40 } });

    await prisma.user.update({ where: { id: winnerB }, data: { energy: 100, currentRegion: 1 } });
    
    // This call inside startBattle(winnerB) will trigger the interruption
    await battleService.startBattle(winnerB, monsterId);

    // 4. Verify Destruction
    console.log("[4/4] Verifying total cargo destruction...");
    const finalWagon = await prisma.wagon.findUnique({ where: { id: wagon.id } });
    const finalSession = await prisma.lootSession.findUnique({ where: { id: session.id } });

    console.log(`   Victim's Wagon Exists: ${finalWagon ? 'YES' : 'NO'} (Expected: NO)`);
    console.log(`   Loot Session Active: ${finalSession.isActive ? 'YES' : 'NO'} (Expected: NO)`);

    // VERDICT
    if (!finalWagon && !finalSession.isActive) {
        console.log("\n🌟 FINAL VERDICT: LOOT INTERRUPTION ARCHITECTURE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MASTER AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterLootAudit().catch(err => console.error(err));
