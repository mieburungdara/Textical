const BattleSimulation = require('../../../../battleSimulation');
const RandomProbability = require('../RandomProbability');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ name: "H" }, 0, {x:25, y:25}, {health_max: 100});
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    console.log("--- DEBUG: RandomProbability ---");
    const test = (chance) => {
        const node = new RandomProbability({ properties: { chance: chance } });
        node.initialize({ properties: { chance: chance } });
        let successes = 0;
        for(let i=0; i<100; i++) {
            if (node.tick(tick) === b3.SUCCESS) successes++;
        }
        console.log(`Chance: ${chance*100}% | Successes out of 100: ${successes}`);
    };

    test(0.5);
    test(0.1);
}
debug();
