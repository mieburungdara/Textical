const BattleSimulation = require('../logic/battleSimulation');
const CheckMana = require('../logic/bt/nodes/conditions/CheckMana');
const CheckSkillReady = require('../logic/bt/nodes/conditions/CheckSkillReady');
const CheckTargetStatus = require('../logic/bt/nodes/conditions/CheckTargetStatus');
const b3 = require('behavior3js');

async function testResourceConditions() {
    console.log("--------------------------------------------------");
    console.log("🔍 STARTING RESOURCE & STATUS DEBUG TEST");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");
    sim.logger.startTick(1);

    // 1. Setup Units
    const hero = sim.addUnit({
        instance_id: "hero", name: "Alpha", team: 0, pos: {x:10, y:10}
    }, 0, {x:10, y:10}, {health_max:100, mana_max:100, attack_damage:10, speed:100});

    const boss = sim.addUnit({
        instance_id: "boss", name: "Omega", team: 1, pos: {x:11, y:10}
    }, 1, {x:11, y:10}, {health_max:500, mana_max:100, attack_damage:10, speed:0});

    // 2. Setup Context
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    blackboard.set('target', boss, 'test-tree', hero.instanceId);
    const tick = { blackboard, tree: { id: 'test-tree' } };

    const runCheck = (NodeClass, name, props) => {
        const node = new NodeClass({ properties: props });
        node.initialize({ properties: props });
        const result = node.tick(tick);
        console.log(`   > ${name.padEnd(25)} | Result: ${result === b3.SUCCESS ? "TRUE" : "FALSE"}`);
    };

    // --- TEST MANA ---
    console.log("[1/3] Testing Mana Ratios...");
    hero.currentMana = 50; // 50%
    runCheck(CheckMana, "MP >= 20%", { threshold: 0.2 });
    runCheck(CheckMana, "MP >= 80%", { threshold: 0.8 });

    // --- TEST COOLDOWNS ---
    console.log("\n[2/3] Testing Cooldowns...");
    hero.skillCooldowns[101] = 0; // Ready
    hero.skillCooldowns[102] = 3; // Not Ready
    runCheck(CheckSkillReady, "Skill 101 Ready?", { skillId: 101 });
    runCheck(CheckSkillReady, "Skill 102 Ready?", { skillId: 102 });

    // --- TEST TARGET STATUS ---
    console.log("\n[3/3] Testing Target Status (Combo Logic)...");
    const BurnStatus = require('../logic/status/definitions/Burn');
    boss.applyEffect(new BurnStatus(3, 5), sim); // Apply Burn to boss
    runCheck(CheckTargetStatus, "Target has BURN?", { effectType: 'BURN' });
    runCheck(CheckTargetStatus, "Target has POISON?", { effectType: 'POISON' });

    console.log("\n--- ENGINE TRACE LOGS ---");
    sim.logger.commitTick(sim.units);
    const logs = sim.logger.getLogs();
    logs[0].events.filter(e => e.msg.includes("[AI_TRACE]")).forEach(e => {
        console.log(`   LOG: ${e.msg}`);
    });

    console.log("\nResource Audit Complete.");
}

testResourceConditions().catch(err => console.error(err));
