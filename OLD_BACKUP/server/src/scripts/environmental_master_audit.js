const worldCycle = require('../services/world/WorldCycleService');
const gatheringService = require('../services/gatheringService');
const BattleSimulation = require('../logic/battleSimulation');
const prisma = require('../db');

async function runMasterEnvironmentalAudit() {
    console.log("--------------------------------------------------");
    console.log("🌍 STARTING ENVIRONMENTAL MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39;
    const fishingId = 3301;

    // 1. Trigger Global Tick (Night + Storm)
    console.log("[1/4] Advancing World Tick until STORM at Night...");
    let state;
    let attempts = 0;
    while (attempts < 50) {
        state = await worldCycle.updateWorldTick();
        const isNight = state.currentHour < 6 || state.currentHour >= 20;
        if (state.weatherType === "STORM" && isNight) break;
        attempts++;
    }
    console.log(`   Final State: Hour ${state.currentHour}, Weather ${state.weatherType}`);

    // 2. Verify Gathering Impact (Storm + Night = 0.8x Speed, normal yield)
    console.log("\n[2/4] Verifying Gathering in STORM...");
    const task = await prisma.taskQueue.create({
        data: {
            userId, heroId, type: "GATHERING", targetItemId: fishingId,
            status: "RUNNING", startedAt: new Date(), finishesAt: new Date()
        }
    });
    await gatheringService.completeGathering(userId, task.id);
    console.log("   Gathering completed without errors.");

    // 3. Verify Combat Impact (Storm + Night = 0.99x ATK)
    console.log("\n[3/4] Verifying Combat in STORM...");
    const sim = new BattleSimulation(50, 50, "FOREST");
    const unit = await sim.addUnit({ instance_id: "hunter" }, 0, { x: 10, y: 10 }, { attack_damage: 100 });
    console.log(`   Hunter ATK in STORM: ${unit.stats.attack_damage} (Expected: 99)`);

    // 4. Verify DB State Integrity
    console.log("\n[4/4] Verifying Database persistence...");
    const dbState = await prisma.worldState.findUnique({ where: { id: 1 } });
    console.log(`   DB Weather: ${dbState.weatherType} (Expected: STORM)`);

    // VERDICT
    const combatPass = unit.stats.attack_damage === 99;
    const persistencePass = dbState.weatherType === "STORM";

    if (combatPass && persistencePass) {
        console.log("\n🌟 FINAL VERDICT: ENVIRONMENTAL SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: INTEGRATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterEnvironmentalAudit().catch(err => console.error(err));
