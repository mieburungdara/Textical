const BattleSimulation = require('../../../../battleSimulation');
const AttackTarget = require('../AttackTarget');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ instance_id: "h", team: 0 }, 0, {x:10, y:10}, {health_max: 100, attack_damage: 50});
    const monster = sim.addUnit({ instance_id: "m", team: 1 }, 1, {x:11, y:10}, {health_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const node = new AttackTarget();
    node.initialize();

    console.log("--- DEBUG: AttackTarget ---");
    console.log(`Target HP before: ${monster.currentHealth}`);
    node.tick(tick);
    console.log(`Target HP after hit: ${monster.currentHealth}`);
}
debug();
