const BattleSimulation = require('../../../../battleSimulation');
const UseSkill = require('../UseSkill');
const b3 = require('behavior3js');

async function debug() {
    const sim = new BattleSimulation(50, 50);
    const hero = sim.addUnit({ 
        instance_id: "h", team: 0,
        skills: [{ id: 5, name: "Heal", type: "HEAL", damage_multiplier: 50, mana_cost: 10 }]
    }, 0, {x:25, y:25}, {health_max: 100, mana_max: 100});
    
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    blackboard.set('target', hero, 't', 'h'); // Self-heal target
    const tick = { blackboard, tree: { id: 't' } };

    const node = new UseSkill({ properties: { skillId: 5 } });
    node.initialize({ properties: { skillId: 5 } });

    console.log("--- DEBUG: UseSkill ---");
    hero.currentHealth = 20;
    console.log(`HP before heal: ${hero.currentHealth} | MP: ${hero.currentMana}`);
    node.tick(tick);
    console.log(`HP after heal: ${hero.currentHealth} | MP: ${hero.currentMana}`);
}
debug();
