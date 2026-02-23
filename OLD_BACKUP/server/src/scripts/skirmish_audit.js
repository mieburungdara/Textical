const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');
const btManager = require('../logic/bt/BTManager');

async function runSkirmishAudit() {
    console.log("--------------------------------------------------");
    console.log("🏹 STARTING SKIRMISH TACTICAL AUDIT");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");

    // 1. Setup Units
    console.log("[1/3] Deploying Archer vs Warrior...");
    
    // THE ARCHER: Uses SkirmisherAI and Sharpshooter trait
    const archer = sim.addUnit({
        instance_id: "archer_1", name: "Robin Hook", 
        traits: ["sharpshooter", "thinker"], bt_tree: "SkirmisherAI"
    }, 0, {x:25, y:25}, {health_max:100, attack_damage:15, speed:12, defense:2, attack_range:1});

    // THE WARRIOR: Fast melee unit to chase the archer
    const warrior = sim.addUnit({
        instance_id: "warrior_1", name: "Angry Orc", 
        traits: ["berserker"], bt_tree: "SimpleAI"
    }, 1, {x:35, y:25}, {health_max:200, attack_damage:20, speed:10, defense:5, attack_range:1});

    sim.units.forEach(u => traitService.executeHook("onBattleStart", u, sim));

    // Archer range should be 1 + 3 = 4
    console.log(` Archer Range: ${archer.stats.attack_range}`);

    // 2. Run Simulation
    console.log("\n[2/3] Executing Skirmish Sequence (50 Ticks)...");
    
    for (let i = 1; i <= 50; i++) {
        sim.processTick();
    }

    // 3. Analysis
    console.log("\n[3/3] Analyzing AI Decisions...");
    const logs = sim.logger.getLogs();
    
    logs.forEach(tick => {
        tick.events.forEach(e => {
            if (e.type === "MOVE") {
                const actor = e.data.actor_id === "archer_1" ? "ARCHER" : "ORC";
                console.log(`   [T${tick.tick}] ${actor.padEnd(7)} moved to [${e.data.to.x}, ${e.data.to.y}]`);
            }
            if (e.type === "ATTACK") {
                console.log(`   [T${tick.tick}] ATTACK | ${e.msg}`);
            }
            if (e.type === "ENGINE" && e.msg.includes("targeted")) {
                // console.log(`   [T${tick.tick}] TRACE  | ${e.msg}`);
            }
        });
    });

    console.log("\nAudit Complete.");
}

runSkirmishAudit();
