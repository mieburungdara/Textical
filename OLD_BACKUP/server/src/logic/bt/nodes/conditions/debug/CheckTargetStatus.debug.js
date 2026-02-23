const BattleSimulation = require('../../../../battleSimulation');
const CheckTargetStatus = require('../CheckTargetStatus');
const BurnStatus = require('../../../../status/definitions/Burn');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h" }, 0, {x:10, y:10}, {health_max: 100});
    const target = sim.addUnit({ instance_id: "t" }, 1, {x:11, y:10}, {health_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    blackboard.set('target', target, 't', 'h');
    const tick = { blackboard, tree: { id: 't' } };

    const test = (effect) => {
        const node = new CheckTargetStatus({ properties: { effectType: effect } });
        node.initialize({ properties: { effectType: effect } });
        console.log(`Target has ${effect}? | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: CheckTargetStatus ---");
    target.applyEffect(new BurnStatus(3, 10), sim);
    test("BURN");
    test("POISON");
}
debug();
