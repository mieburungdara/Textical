const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');

async function runLavaTest() {
    console.log("--------------------------------------------------");
    console.log("🔥 STARTING LAVA TERRAIN AUDIT");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "VOLCANO");

    // 1. Manually set Tile [25, 25] as LAVA (ID 6)
    sim.grid.terrainGrid[25][25] = 6;

    // 2. Mock the Terrain Effects from Database
    sim.terrainEffects = [
        {
            effectType: "BURN",
            power: 10,
            chance: 1.0,
            tickInterval: 1,
            requiredTileId: 6 // Specifically for LAVA tiles
        }
    ];

    // 3. Deploy unit exactly on the lava tile
    const unit = sim.addUnit({
        instance_id: "test_unit", name: "Fire Walker", 
        traits: [], bt_tree: "SimpleAI"
    }, 0, {x:25, y:25}, {health_max:100, attack_damage:10, defense:0});

    console.log(`[1/3] Unit deployed on Tile [25,25] (Terrain ID: ${sim.grid.terrainGrid[25][25]})`);

    // 4. Run Simulation for 5 ticks
    console.log("\n[2/3] Running 5 Ticks of Lava Exposure...");
    for (let i = 1; i <= 5; i++) {
        sim.processTick();
    }

    // 5. Verify Results
    console.log("\n[3/3] Analyzing Vitality Logs...");
    const logs = sim.logger.getLogs();
    let burnFound = false;
    let damageFound = false;

    logs.forEach(tick => {
        tick.events.forEach(e => {
            if (e.msg.includes("burn") || e.type === "BURN") {
                console.log(`   [T${tick.tick}] EVENT | ${e.msg}`);
                burnFound = true;
            }
            if (e.type === "DAMAGE" && e.data.type === "BURN") {
                console.log(`   [T${tick.tick}] DAMAGE| Received ${e.data.damage} Burn Damage. HP Left: ${tick.units[0].hp}`);
                damageFound = true;
            }
        });
    });

    if (burnFound && damageFound) {
        console.log("\n✅ LAVA TEST PASSED: Unit correctly suffered and took damage from BURN.");
    } else {
        console.log("\n❌ LAVA TEST FAILED: No burn effects detected.");
    }
}

runLavaTest();
