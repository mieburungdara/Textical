const BattleSimulation = require('../../../../battleSimulation');
const CheckAllyCount = require('../CheckAllyCount');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h", team: 0 }, 0, {x:25, y:25}, {health_max: 100});
    const ally = sim.addUnit({ instance_id: "a", team: 0 }, 0, {x:26, y:25}, {health_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (count, op) => {
        const node = new CheckAllyCount({ properties: { minCount: count, comparison: op } });
        node.initialize({ properties: { minCount: count, comparison: op } });
        console.log(`Allies: 1 | Goal: ${op}${count} | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: CheckAllyCount ---");
    test(1, ">=");
    test(2, ">=");
}
debug();
