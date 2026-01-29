const BattleSimulation = require('../../../../battleSimulation');
const FindTarget = require('../FindTarget');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h", team: 0 }, 0, {x:25, y:25}, {health_max: 100});
    const mob = sim.addUnit({ instance_id: "m", team: 1 }, 1, {x:30, y:30}, {health_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const node = new FindTarget({ properties: { strategy: 'ENEMIES' } });
    node.initialize({ properties: { strategy: 'ENEMIES' } });

    console.log("--- DEBUG: FindTarget ---");
    const result = node.tick(tick);
    const found = blackboard.get('target'); // FIXED KEY
    console.log(`Searching for Enemy... | Result: ${result === b3.SUCCESS} | Target Found: ${found ? found.data.name : 'NONE'}`);
}
debug();