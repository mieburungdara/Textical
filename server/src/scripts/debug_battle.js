const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');

async function runDebug() {
    console.log("Initializing Tactical Engine Debug (10 Ticks Limit)...");
    
    const sim = new BattleSimulation(50, 50, "FOREST");
    
    // Add custom units similar to your payload
    const walkerData = { 
        instance_id: "walker", 
        name: "The Walker", 
        traits: ["thinker"],
        bt_tree: "SimpleAI", 
        team: 0, 
        pos: {x:5, y:5}
    };
    const walkerStats = {health_max:100, mana_max:50, attack_damage:0, speed:15, attack_range:1, defense: 5, dodge_rate: 5, crit_chance: 0.1, crit_damage: 1.5};
    
    const targetData = { 
        instance_id: "target", 
        name: "Training Dummy", 
        traits: ["thorns"],
        bt_tree: "SimpleAI", 
        team: 1, 
        pos: {x:10, y:10} // Reduced distance to ensure action within 10 ticks
    };
    const targetStats = {health_max:1000, mana_max:100, attack_damage:0, speed:0, attack_range:1, defense: 10, dodge_rate: 0, crit_chance: 0, crit_damage: 1};

    sim.addUnit(walkerData, 0, walkerData.pos, walkerStats);
    sim.addUnit(targetData, 1, targetData.pos, targetStats);

    // Initial Battle Start Hooks
    sim.units.forEach(u => traitService.executeHook("onBattleStart", u, sim));
    sim.logger.startTick(0);
    sim.logger.addEvent("ENGINE", "Debug Session Started");
    sim.logger.commitTick(sim.units);

    // Run precisely 10 ticks
    for (let i = 1; i <= 10; i++) {
        try {
            sim.processTick();
        } catch (e) {
            console.error(`
[CRASH AT TICK ${i}] ${e.stack}`);
            process.exit(1);
        }
    }

    console.log("\n--- DEBUG LOGS (TOP 10 TICKS) ---");
    const logs = sim.logger.getLogs();
    logs.forEach(tick => {
        console.log(`
[TICK ${tick.tick}]`);
        tick.events.forEach(e => {
            console.log(`  [${e.type}] ${e.msg}`);
            if (e.data && (e.type === "ENGINE" || e.type === "TRAIT")) {
                console.log(`     Details: ${JSON.stringify(e.data)}`);
            }
        });
    });
    
    console.log("\nDebug Complete.");
}

runDebug().catch(err => {
    console.error("FATAL DEBUG ERROR:", err);
});
