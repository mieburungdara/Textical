const BattleSimulation = require('../../../../battleSimulation');
const IsTargetInRange = require('../IsTargetInRange');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h" }, 0, {x:10, y:10}, {health_max: 100, attack_range: 1});
    const target = sim.addUnit({ instance_id: "t" }, 1, {x:11, y:10}, {health_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const node = new IsTargetInRange();
    node.initialize();

    console.log("--- DEBUG: IsTargetInRange ---");
    console.log(`Dist: 1 | Range: 1 | Result: ${node.tick(tick) === b3.SUCCESS}`);
    
    target.gridPos = {x: 15, y: 10};
    console.log(`Dist: 5 | Range: 1 | Result: ${node.tick(tick) === b3.SUCCESS}`);
}
debug();
