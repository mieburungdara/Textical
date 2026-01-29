const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');

async function runTacticalAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING AAA TACTICAL MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");
    sim.grid.terrainGrid[25][24] = 6; 

    // 1. Setup Scenario: Shadow Blade behind Slow Guard
    const assassin = sim.addUnit({ instance_id: "assassin", name: "Shadow Blade", facing: "SOUTH" }, 0, {x:25, y:25}, {health_max:100, attack_damage:50, speed:100});
    const target = sim.addUnit({ instance_id: "target", name: "Slow Guard", facing: "SOUTH" }, 1, {x:25, y:26}, {health_max:200, attack_damage:10, speed:0, defense: 10, block_chance: 1.0});

    sim.units.forEach(u => traitService.executeHook("onBattleStart", u, sim));

    // 2. Test Backstab
    console.log("[1/2] Executing Backstab (Assassin at [25,25] hitting Target at [25,26] looking SOUTH)...");
    sim.logger.startTick(1);
    sim.rules.performAttack(assassin, target);
    sim.logger.commitTick(sim.units);

    // 3. Test Reaction Attacks
    console.log("[2/2] Executing Attack of Opportunity...");
    sim.logger.startTick(2);
    const walker = sim.addUnit({ instance_id: "walker", name: "Brave Walker", team: 0, facing: "SOUTH" }, 0, {x:20, y:20}, {health_max:100, speed:10});
    const sentinel = sim.addUnit({ instance_id: "sentinel", name: "Gatekeeper", team: 1, facing: "SOUTH" }, 1, {x:21, y:20}, {health_max:100, attack_damage:10, attack_range: 1});
    
    sim.ai.moveTowards(walker, { gridPos: {x:21, y:21} });
    sim.logger.commitTick(sim.units);

    console.log("\n--- TACTICAL RESULTS ---");
    sim.logger.getLogs().forEach(tick => {
        tick.events.forEach(e => {
            console.log(`   [T${tick.tick}] [${e.type}] ${e.msg}`);
            if (e.data && e.data.rel_pos) console.log(`      > Detected Position: ${e.data.rel_pos} | Damage: ${e.data.damage}`);
        });
    });

    console.log("\nTactical Audit Complete.");
}

runTacticalAudit();
