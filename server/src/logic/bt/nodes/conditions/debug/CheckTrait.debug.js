const BattleSimulation = require('../../../../battleSimulation');
const CheckTrait = require('../CheckTrait');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ name: "H", traits: ["giant"], race: "elf" }, 0, {x:25, y:25}, {health_max: 100});
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (trait) => {
        const node = new CheckTrait({ properties: { traitName: trait } });
        node.initialize({ properties: { traitName: trait } });
        console.log(`Identity: elf+giant | Search: ${trait} | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: CheckTrait ---");
    test("giant");
    test("elf");
    test("vampire");
}
debug();
