const BattleSimulation = require('../../../../battleSimulation');
const CheckTerrain = require('../CheckTerrain');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50, "VOLCANO");
    const hero = sim.addUnit({ name: "H" }, 0, {x:25, y:25}, {health_max: 100});
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (type) => {
        const node = new CheckTerrain({ properties: { terrainType: type } });
        node.initialize({ properties: { terrainType: type } });
        console.log(`Current: VOLCANO | Req: ${type} | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: CheckTerrain ---");
    test("VOLCANO");
    test("FOREST");
}
debug();
