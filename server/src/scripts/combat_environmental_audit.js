const BattleSimulation = require('../logic/battleSimulation');
const prisma = require('../db');

async function runCombatEnvAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING COMBAT ENVIRONMENTAL AUDIT");
    console.log("--------------------------------------------------\n");

    // 0. Setup: World is STORM at 02:00 (Expect: 0.99x ATK total for night/storm mix)
    console.log("[0/2] Setting weather to STORM at Night (02:00)...");
    await prisma.worldState.upsert({
        where: { id: 1 },
        update: { currentHour: 2, weatherType: "STORM" },
        create: { id: 1, currentHour: 2, weatherType: "STORM" }
    });

    const sim = new BattleSimulation(50, 50, "FOREST");
    const baseAtk = 100;

    // 1. Add Unit and Check Stats
    console.log("[1/2] Adding unit with 100 base ATK...");
    const unit = await sim.addUnit({ instance_id: "test" }, 0, { x: 10, y: 10 }, { attack_damage: baseAtk });
    
    // Night (1.1x) * Storm (0.9x) = 0.99x -> 99 ATK
    console.log(`   Unit Final ATK: ${unit.stats.attack_damage} (Expected: 99)`);

    // VERDICT
    if (unit.stats.attack_damage === 99) {
        console.log("\n🌟 FINAL VERDICT: COMBAT ENVIRONMENTAL INTEGRATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: COMBAT STAT SCALING FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runCombatEnvAudit().catch(err => console.error(err));
