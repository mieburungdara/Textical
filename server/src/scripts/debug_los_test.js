const BattleSimulation = require('../logic/battleSimulation');
const CheckLineOfSight = require('../logic/bt/nodes/conditions/CheckLineOfSight');
const b3 = require('behavior3js');

async function testLOSTactics() {
    console.log("--------------------------------------------------");
    console.log("👁️ STARTING LINE-OF-SIGHT (LOS) DEBUG TEST");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "DUNGEON");
    sim.logger.startTick(1);

    // 1. Setup Units
    const hero = sim.addUnit({
        instance_id: "archer", name: "Sniper", team: 0, pos: {x:10, y:10}
    }, 0, {x:10, y:10}, {health_max:100, speed:100});

    const target = sim.addUnit({
        instance_id: "mob", name: "Goblin", team: 1, pos: {x:15, y:10}
    }, 1, {x:15, y:10}, {health_max:100, speed:0});

    // 2. Setup Context
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    blackboard.set('target', target, 'test-tree', hero.instanceId);
    const tick = { blackboard, tree: { id: 'test-tree' } };

    const checkLOS = (name) => {
        const node = new CheckLineOfSight();
        node.initialize();
        const result = node.tick(tick);
        console.log(`   > ${name.padEnd(25)} | Result: ${result === b3.SUCCESS ? "VISIBLE" : "BLOCKED"}`);
    };

    // --- SCENARIO 1: CLEAR PATH ---
    console.log("[1/2] Testing Clear Path...");
    checkLOS("Open Field (No Walls)");

    // --- SCENARIO 2: OBSTRUCTED BY WALL ---
    console.log("\n[2/2] Testing Obstructed Path...");
    // Put a wall (ID 6) at [12, 10], which is directly between x:10 and x:15
    sim.grid.terrainGrid[10][12] = 6; 
    console.log("   --- Wall placed at [12, 10] ---");
    checkLOS("Blocked by Stone Wall");

    console.log("\n--- ENGINE TRACE LOGS ---");
    sim.logger.commitTick(sim.units);
    const logs = sim.logger.getLogs();
    logs[0].events.filter(e => e.msg.includes("[AI_TRACE]")).forEach(e => {
        console.log(`   LOG: ${e.msg}`);
    });

    console.log("\nLOS Audit Complete.");
}

testLOSTactics().catch(err => console.error(err));
