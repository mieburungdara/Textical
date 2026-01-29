const BattleSimulation = require('../../../../battleSimulation');
const CheckHealth = require('../CheckHealth');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ name: "Alpha" }, 0, {x:25, y:25}, {health_max: 100});
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (hp, thresh) => {
        hero.currentHealth = hp;
        const node = new CheckHealth({ properties: { threshold: thresh } });
        node.initialize({ properties: { threshold: thresh } });
        console.log(`HP: ${hp}/${hero.stats.health_max} | Thresh: ${thresh*100}% | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: CheckHealth ---");
    test(100, 0.5);
    test(30, 0.5);
}
debug();
