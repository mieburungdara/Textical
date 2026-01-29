const BattleSimulation = require('../logic/battleSimulation');
const CheckDistance = require('../logic/bt/nodes/conditions/CheckDistance');
const b3 = require('behavior3js');

async function testCheckDistance() {
    console.log("--------------------------------------------------");
    console.log("🔍 STARTING CHECK_DISTANCE DEBUG TEST");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");
    sim.logger.startTick(1);

    // 1. Setup Units
    const hero = sim.addUnit({
        instance_id: "hero", name: "Alpha", team: 0, pos: {x:10, y:10}
    }, 0, {x:10, y:10}, {health_max:100, attack_damage:10, speed:100});

    const target = sim.addUnit({
        instance_id: "target", name: "Omega", team: 1, pos: {x:15, y:10} // Distance = 5
    }, 1, {x:15, y:10}, {health_max:100, attack_damage:10, speed:100});

    // 2. Setup Context
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    // Manually set target in blackboard to simulate FindTarget success
    blackboard.set('target', target, 'test-tree', hero.instanceId);
    
    const tick = {
        blackboard: blackboard,
        tree: { id: 'test-tree' }
    };

    console.log(`✅ Units deployed. Real Distance Alpha -> Omega: ${sim.grid.getDistance(hero.gridPos, target.gridPos)}`);

    // 3. Run Scenarios
    const runScenario = (name, props) => {
        const node = new CheckDistance({ properties: props });
        node.initialize({ properties: props });
        
        const result = node.tick(tick);
        const resultStr = result === b3.SUCCESS ? "SUCCESS (TRUE)" : "FAILURE (FALSE)";
        console.log(`   > SCENARIO: ${name.padEnd(30)} | Result: ${resultStr}`);
    };

    console.log("\n[2/3] Testing Comparison Operators (Target Distance is 5)...");
    runScenario("Distance <= 5", { distance: 5, operator: "<=" });
    runScenario("Distance < 5", { distance: 5, operator: "<" });
    runScenario("Distance == 5", { distance: 5, operator: "==" });
    runScenario("Distance >= 5", { distance: 5, operator: ">=" });
    runScenario("Distance > 5", { distance: 5, operator: ">" });
    runScenario("Distance <= 3", { distance: 3, operator: "<=" });
    runScenario("Distance >= 10", { distance: 10, operator: ">=" });

    // 4. Test with Moving Target
    console.log("\n[3/3] Moving Target to [11, 10] (Distance = 1)...");
    target.gridPos = {x:11, y:10};
    
    runScenario("Distance <= 1 (NEW POS)", { distance: 1, operator: "<=" });
    runScenario("Distance > 1 (NEW POS)", { distance: 1, operator: ">" });

    console.log("\n--- ENGINE TRACE LOGS ---");
    // Correct way to fetch logs after processing
    sim.logger.commitTick(sim.units);
    const logs = sim.logger.getLogs();
    logs[0].events.filter(e => e.msg.includes("[AI_TRACE]")).forEach(e => {
        console.log(`   LOG: ${e.msg}`);
    });

    console.log("\nDebug Test Complete.");
}

testCheckDistance().catch(err => console.error(err));
