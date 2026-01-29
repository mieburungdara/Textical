const BattleSimulation = require('../../../../battleSimulation');
const CheckMana = require('../CheckMana');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ name: "Mage" }, 0, {x:25, y:25}, {health_max: 100, mana_max: 100});
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (mp, thresh) => {
        hero.currentMana = mp;
        const node = new CheckMana({ properties: { threshold: thresh } });
        node.initialize({ properties: { threshold: thresh } });
        console.log(`MP: ${mp}/100 | Req: >= ${thresh*100}% | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: CheckMana ---");
    test(50, 0.2);
    test(10, 0.2);
}
debug();
