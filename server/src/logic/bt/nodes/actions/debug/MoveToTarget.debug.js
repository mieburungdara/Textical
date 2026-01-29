const BattleSimulation = require('../../../../battleSimulation');
const MoveToTarget = require('../MoveToTarget');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h", team: 0 }, 0, {x:10, y:10}, {health_max: 100});
    const target = sim.addUnit({ instance_id: "t", team: 1 }, 1, {x:15, y:10}, {health_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    blackboard.set('target', target, 't', 'h');
    const tick = { blackboard, tree: { id: 't' } };

    const node = new MoveToTarget();
    node.initialize();

    console.log("--- DEBUG: MoveToTarget ---");
    console.log(`Current Pos: [10,10] | Goal: [15,10]`);
    node.tick(tick);
    console.log(`New Pos after step: [${hero.gridPos.x}, ${hero.gridPos.y}]`);
}
debug();
