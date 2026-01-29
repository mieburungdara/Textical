const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');
const CheckAllyCount = require('../logic/bt/nodes/conditions/CheckAllyCount');
const b3 = require('behavior3js');

async function testCheckAllyCount() {
    console.log("--------------------------------------------------");
    console.log("🔍 STARTING CHECK_ALLY_COUNT DEBUG TEST");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");
    sim.logger.startTick(1);

    // 1. Setup Units
    console.log("[1/3] Deploying Units...");
    
    // The Subject
    const hero = sim.addUnit({
        instance_id: "hero_alpha", name: "Alpha", traits: [], team: 0, pos: {x:25, y:25}
    }, 0, {x:25, y:25}, {health_max:100, attack_damage:10, speed:100});

    // An Ally
    const ally = sim.addUnit({
        instance_id: "ally_bravo", name: "Bravo", traits: [], team: 0, pos: {x:26, y:25}
    }, 0, {x:26, y:25}, {health_max:100, attack_damage:10, speed:100});

    // An Enemy (should not be counted as ally)
    const enemy = sim.addUnit({
        instance_id: "mob_omega", name: "Omega", traits: [], team: 1, pos: {x:27, y:25}
    }, 1, {x:27, y:25}, {health_max:100, attack_damage:10, speed:100});

    // 2. Setup Context
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    
    const tick = {
        blackboard: blackboard,
        tree: { id: 'test-tree' }
    };

    console.log(`✅ Units ready. Allies for Alpha: ${sim.units.filter(u => u.teamId === 0 && u.instanceId !== 'hero_alpha').length}`);

    // 3. Run Scenarios
    console.log("\n[2/3] Running Logic Scenarios...");

    const runScenario = (name, props) => {
        const node = new CheckAllyCount({ properties: props });
        // Manually initialize because we are bypassing the library's loader
        node.initialize({ properties: props });
        
        const result = node.tick(tick);
        const resultStr = result === b3.SUCCESS ? "SUCCESS (TRUE)" : (result === b3.FAILURE ? "FAILURE (FALSE)" : "ERROR");
        console.log(`   > SCENARIO: ${name.padEnd(30)} | Result: ${resultStr}`);
    };

    runScenario("At least 1 ally (>= 1)", { minCount: 1, comparison: ">=" });
    runScenario("More than 1 ally (> 1)", { minCount: 1, comparison: ">" });
    runScenario("Exactly 1 ally (== 1)", { minCount: 1, comparison: "==" });
    runScenario("Less than or equal 1 (<= 1)", { minCount: 1, comparison: "<=" });
    runScenario("Less than 1 (< 1)", { minCount: 1, comparison: "<" });

    // 4. Test with Dead Ally
    console.log("\n[3/3] Killing Ally and Re-testing...");
    ally.currentHealth = 0;
    ally.isDead = true;
    
    runScenario("At least 1 ally (>= 1) AFTER DEATH", { minCount: 1, comparison: ">=" });
    runScenario("Less than 1 (< 1) AFTER DEATH", { minCount: 1, comparison: "<" });

    console.log("\n--- ENGINE TRACE LOGS ---");
    const logs = sim.logger.getLogs();
    logs[0].events.filter(e => e.msg.includes("[AI_TRACE]")).forEach(e => {
        console.log(`   LOG: ${e.msg}`);
    });

    console.log("\nDebug Test Complete.");
}

testCheckAllyCount().catch(err => console.error(err));
