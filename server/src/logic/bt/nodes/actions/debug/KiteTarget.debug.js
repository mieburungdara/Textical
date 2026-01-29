const BattleSimulation = require('../../../../battleSimulation');
const KiteTarget = require('../KiteTarget');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h", team: 0 }, 0, {x:25, y:25}, {health_max: 100});
    const monster = sim.addUnit({ instance_id: "m", team: 1 }, 1, {x:26, y:25}, {health_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    blackboard.set('target', monster); // FIXED KEY
    const tick = { blackboard, tree: { id: 't' } };

    const node = new KiteTarget();
    node.initialize();

    console.log("--- DEBUG: KiteTarget ---");
    console.log(`Units adjacent at [25,25] and [26,25]`);
    node.tick(tick);
    console.log(`Hero position after kiting: [${hero.gridPos.x}, ${hero.gridPos.y}] (Should be further)`);
}
debug();