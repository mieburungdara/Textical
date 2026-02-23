const BattleSimulation = require('../logic/battleSimulation');
const CheckHealth = require('../logic/bt/nodes/conditions/CheckHealth');
const b3 = require('behavior3js');

async function testCheckHealth() {
    console.log("--------------------------------------------------");
    console.log("🔍 STARTING CHECK_HEALTH DEBUG TEST");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");
    sim.logger.startTick(1);

    // 1. Setup Unit
    const hero = sim.addUnit({
        instance_id: "hero_alpha", name: "Alpha", traits: [], team: 0, pos: {x:25, y:25}
    }, 0, {x:25, y:25}, {health_max: 200, attack_damage: 10, speed: 100});

    // 2. Setup Context
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    
    const tick = {
        blackboard: blackboard,
        tree: { id: 'test-tree' }
    };

    const runScenario = (name, currentHp, threshold) => {
        hero.currentHealth = currentHp;
        const node = new CheckHealth({ properties: { threshold: threshold } });
        node.initialize({ properties: { threshold: threshold } });
        
        const result = node.tick(tick);
        const resultStr = result === b3.SUCCESS ? "SUCCESS (TRUE)" : "FAILURE (FALSE)";
        console.log(`   > SCENARIO: ${name.padEnd(35)} | HP: ${currentHp}/${hero.stats.health_max} | Threshold: ${threshold*100}% | Result: ${resultStr}`);
    };

    console.log("[2/3] Running HP Ratio Scenarios...");
    runScenario("Full Health vs 50%", 200, 0.5);
    runScenario("Half Health vs 50%", 100, 0.5);
    runScenario("Low Health vs 50%", 40, 0.5);
    runScenario("Critical Health vs 20%", 30, 0.2);
    runScenario("Safe Health vs 20%", 100, 0.2);

    console.log("\n[3/3] Verifying Trace Logs...");
    sim.logger.commitTick(sim.units);
    const logs = sim.logger.getLogs();
    logs[0].events.filter(e => e.msg.includes("[AI_TRACE]")).forEach(e => {
        console.log(`   LOG: ${e.msg}`);
    });

    console.log("\nDebug Test Complete.");
}

testCheckHealth().catch(err => console.error(err));
