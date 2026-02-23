const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');

async function verifyAITrace() {
    console.log("Verifying Neural AI Trace Output...");
    
    const sim = new BattleSimulation(50, 50, "FOREST");
    
    // Setup unit dengan HP rendah agar memicu CheckHealth
    sim.addUnit({
        instance_id: "test_subject", name: "Subject X", 
        traits: [], bt_tree: "SimpleAI"
    }, 0, {x:25, y:25}, {health_max:100, attack_damage:10, speed:100});

    // Manually set low health
    sim.units[0].currentHealth = 20; 

    // Run 1 tick
    sim.processTick();

    const logs = sim.logger.getLogs();
    console.log("\n--- CAPTURED AI TRACE LOGS ---");
    
    const traces = logs[0].events.filter(e => e.msg.includes("[AI_TRACE]"));
    
    if (traces.length > 0) {
        traces.forEach(t => console.log(`   SUCCESS: ${t.msg}`));
    } else {
        console.log("   FAILED: No AI_TRACE detected.");
    }
}

verifyAITrace();
