const BattleSimulation = require('../../../../battleSimulation');
const CheckDistance = require('../CheckDistance');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h" }, 0, {x:10, y:10}, {health_max: 100});
    const target = sim.addUnit({ instance_id: "t" }, 1, {x:15, y:10}, {health_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    blackboard.set('target', target, 't', 'h');
    const tick = { blackboard, tree: { id: 't' } };

    const test = (dist, op) => {
        const node = new CheckDistance({ properties: { distance: dist, operator: op } });
        node.initialize({ properties: { distance: dist, operator: op } });
        console.log(`Real Dist: 5 | Target: ${op}${dist} | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: CheckDistance ---");
    test(5, "<=");
    test(3, ">");
}
debug();
