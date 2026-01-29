const BattleSimulation = require('../../../../battleSimulation');
const NearbyUnitsCount = require('../NearbyUnitsCount');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h", team: 0 }, 0, {x:25, y:25}, {health_max: 100});
    sim.addUnit({ instance_id: "m1", team: 1 }, 1, {x:26, y:25}, {health_max: 50});
    sim.addUnit({ instance_id: "m2", team: 1 }, 1, {x:24, y:25}, {health_max: 50});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (team, min) => {
        const node = new NearbyUnitsCount({ properties: { range: 1, team: team, minCount: min } });
        node.initialize({ properties: { range: 1, team: team, minCount: min } });
        console.log(`Team: ${team} | Req: >=${min} | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: NearbyUnitsCount ---");
    test("OTHER", 2);
    test("SAME", 1);
}
debug();
