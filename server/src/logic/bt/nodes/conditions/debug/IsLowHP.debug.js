const BattleSimulation = require('../../../../battleSimulation');
const IsLowHP = require('../IsLowHP');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ name: "H" }, 0, {x:25, y:25}, {health_max: 100});
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (hp) => {
        hero.currentHealth = hp;
        const node = new IsLowHP();
        node.initialize();
        console.log(`HP: ${hp}/100 | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: IsLowHP ---");
    test(100);
    test(20);
}
debug();
