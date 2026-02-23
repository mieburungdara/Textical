const service = require('../services/world/WorldCycleService');
const prisma = require('../db');

async function runWorldCycleAudit() {
    console.log("--------------------------------------------------");
    console.log("🌍 STARTING WORLD CYCLE AUDIT");
    console.log("--------------------------------------------------\n");

    // 0. Setup: Ensure state 1 exists
    await prisma.worldState.upsert({
        where: { id: 1 },
        update: { currentHour: 22, weatherType: "CLEAR" },
        create: { id: 1, currentHour: 22, weatherType: "CLEAR" }
    });

    // 1. Test Hour Increment
    console.log("[1/2] Testing hour increment (22 -> 23)...");
    await service.updateWorldTick();
    let state = await service.getWorldState();
    console.log(`   State: Hour ${state.currentHour}, Weather ${state.weatherType}`);

    console.log("\n[2/2] Testing day reset (23 -> 0)...");
    await service.updateWorldTick();
    state = await service.getWorldState();
    console.log(`   State: Hour ${state.currentHour}, Weather ${state.weatherType}`);

    // VERDICT
    if (state.currentHour === 0) {
        console.log("\n🌟 FINAL VERDICT: WORLD CYCLE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: CYCLE FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runWorldCycleAudit().catch(err => console.error(err));
