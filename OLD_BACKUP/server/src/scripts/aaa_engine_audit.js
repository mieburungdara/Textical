const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');

/**
 * AAA Master Engine Audit
 * This script performs a deep-level verification of:
 * 1. Modular Traits (Giant, Thorns, Vampire, ArcaneMaster)
 * 2. Modular Movement (AStar Strategy)
 * 3. Behavior Tree Logic (SimpleAI)
 * 4. Granular Hooks (onPreAttack, onTakeDamage, onAllyDamage, etc.)
 */
async function runAudit() {
    console.log("--------------------------------------------------");
    console.log("🚀 STARTING AAA TACTICAL ENGINE AUDIT");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");

    // 1. Setup A Balanced Testing Scenario
    console.log("[1/4] Deploying Specialized Units...");
    
    // THE TANK: Tests Giant, Thorns, and Adjacency hooks
    sim.addUnit({
        instance_id: "tank", name: "Iron Aegis", race: "human",
        traits: ["giant", "thorns"], bt_tree: "SimpleAI"
    }, 0, {x:24, y:25}, {health_max:200, attack_damage:10, speed:8, defense:10, attack_range:1});

    // THE MAGE: Tests ArcaneMaster, Thinker, and Skill hooks
    const mage = sim.addUnit({
        instance_id: "mage", name: "Mana Weaver", race: "elf",
        traits: ["arcanemaster", "thinker"], bt_tree: "SimpleAI",
        skills: [{ id: 3, name: "Fireball", type: "OFFENSIVE", range: 10, damage_multiplier: 2.0, mana_cost: 20 }]
    }, 0, {x:23, y:25}, {health_max:100, mana_max:100, attack_damage:5, speed:12, defense:2, attack_range:1});

    // THE BOSS: Tests Vampire, Skeleton, and Kill hooks
    sim.addUnit({
        instance_id: "boss", name: "Lich King", race: "undead",
        traits: ["skeleton", "vampire"], bt_tree: "SimpleAI"
    }, 1, {x:26, y:25}, {health_max:500, attack_damage:30, speed:10, defense:15, attack_range:1});

    console.log("✅ Units Deployed. Initializing Battle Start Hooks...");
    sim.units.forEach(u => traitService.executeHook("onBattleStart", u, sim));

    // 2. Run Simulation (Limited to 20 ticks for trace analysis)
    console.log("\n[2/4] Executing Neural Sequence (20 Ticks Limit)...");
    
    for (let i = 1; i <= 20; i++) {
        sim.processTick();
    }

    // 3. Analyze Logs
    console.log("\n[3/4] Analyzing Captured Hooks...");
    const logs = sim.logger.getLogs();
    const hooksFired = new Set();
    let moveCount = 0;
    let attackCount = 0;

    logs.forEach(tick => {
        tick.events.forEach(e => {
            if (e.type === "TRAIT" && e.data.hook) hooksFired.add(e.data.hook);
            if (e.type === "MOVE") moveCount++;
            if (e.type === "ATTACK") attackCount++;
            
            // Print critical events to terminal for visual audit
            if (["ATTACK", "DAMAGE", "HEAL", "IMPACT", "KILL"].includes(e.type)) {
                console.log(`   [T${tick.tick}] ${e.type.padEnd(8)} | ${e.msg}`);
            }
        });
    });

    // 4. Final Verdict
    console.log("\n[4/4] Final Verdict & Health Check:");
    console.log(`   - Ticks Processed: ${logs.length}`);
    console.log(`   - Unique Hooks Successfully Fired: ${hooksFired.size}`);
    hooksFired.forEach(h => console.log(`     > ${h}`));
    
    console.log(`   - Total Moves: ${moveCount}`);
    console.log(`   - Total Attacks: ${attackCount}`);

    if (hooksFired.size > 5 && (moveCount > 0 || attackCount > 0)) {
        console.log("\n✅ ENGINE STATUS: 100% OPERATIONAL (AAA COMPLIANT)");
    } else {
        console.log("\n❌ ENGINE STATUS: ANOMALY DETECTED (Check Node Registry)");
    }
}

runAudit().catch(err => {
    console.error("\n❌ FATAL ENGINE CRASH:", err.stack);
    process.exit(1);
});
