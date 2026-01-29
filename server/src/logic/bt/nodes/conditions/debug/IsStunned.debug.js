const BattleSimulation = require('../../../../battleSimulation');
const IsStunned = require('../IsStunned');
const StunStatus = require('../../../../status/definitions/Stun');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ name: "H" }, 0, {x:25, y:25}, {health_max: 100});
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (stunned) => {
        if (stunned) hero.applyEffect(new StunStatus(3), sim);
        else hero.activeEffects = [];
        
        const node = new IsStunned();
        node.initialize();
        console.log(`Is Stunned: ${stunned} | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: IsStunned ---");
    test(false);
    test(true);
}
debug();
