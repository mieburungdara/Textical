const BattleSimulation = require('../../../../battleSimulation');
const CheckLineOfSight = require('../CheckLineOfSight');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h" }, 0, {x:10, y:10}, {health_max: 100});
    const target = sim.addUnit({ instance_id: "t" }, 1, {x:15, y:10}, {health_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    blackboard.set('target', target, 't', 'h');
    const tick = { blackboard, tree: { id: 't' } };

    const node = new CheckLineOfSight();
    node.initialize();

    console.log("--- DEBUG: CheckLineOfSight ---");
    console.log(`Path Clear | Result: ${node.tick(tick) === b3.SUCCESS}`);
    
    sim.grid.terrainGrid[10][12] = 6; // Wall
    console.log(`Path Blocked | Result: ${node.tick(tick) === b3.SUCCESS}`);
}
debug();
