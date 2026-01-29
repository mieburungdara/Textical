const BattleSimulation = require('../../../../battleSimulation');
const CheckSkillReady = require('../CheckSkillReady');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ name: "H" }, 0, {x:25, y:25}, {health_max: 100});
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 't' } };

    const test = (sid, cd) => {
        hero.skillCooldowns[sid] = cd;
        const node = new CheckSkillReady({ properties: { skillId: sid } });
        node.initialize({ properties: { skillId: sid } });
        console.log(`Skill ${sid} CD: ${cd} | Result: ${node.tick(tick) === b3.SUCCESS}`);
    };

    console.log("--- DEBUG: CheckSkillReady ---");
    test(101, 0);
    test(101, 3);
}
debug();
