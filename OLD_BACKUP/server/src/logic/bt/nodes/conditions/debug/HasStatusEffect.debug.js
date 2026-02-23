const BattleSimulation = require('../../../../battleSimulation');
const HasStatusEffect = require('../HasStatusEffect');
const StunStatus = require('../../../../status/definitions/Stun');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ name: "H" }, 0, {x:25, y:25}, {health_max: 100});
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (effect) => {
        const node = new HasStatusEffect({ properties: { effectType: effect } });
        node.initialize({ properties: { effectType: effect } });
        console.log(`Self has ${effect}? | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: HasStatusEffect ---");
    hero.applyEffect(new StunStatus(3), sim);
    test("STUN");
    test("BURN");
}
debug();
