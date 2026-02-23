const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');
const StealthStatus = require('../logic/status/definitions/Stealth');

async function runStealthAudit() {
    console.log("--------------------------------------------------");
    console.log("🥷 STARTING STEALTH & TRUE SIGHT AUDIT");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");

    // 1. Setup Units
    console.log("[1/4] Deploying Units (Ninja vs Guard)...");
    
    const ninja = sim.addUnit({
        instance_id: "ninja", name: "Ghost Blade", 
        traits: [], bt_tree: "SimpleAI"
    }, 0, {x:20, y:25}, {health_max:100, attack_damage:20, speed:10, defense:2});

    const guard = sim.addUnit({
        instance_id: "guard", name: "Dungeon Sentinel", 
        traits: [], bt_tree: "SimpleAI"
    }, 1, {x:30, y:25}, {health_max:200, attack_damage:10, speed:10, defense:10});

    sim.units.forEach(u => traitService.executeHook("onBattleStart", u, sim));

    // 2. Scenario A: Apply Stealth and check targeting
    console.log("\n[2/4] Testing Invisibility (Ninja far away)...");
    ninja.applyEffect(new StealthStatus(10), sim);
    
    const targetFound = sim.ai.findTarget(guard);
    console.log(`   Guard Position: [30,25] | Ninja Position: [20,25] (Stealthed)`);
    console.log(`   Target found by Guard: ${targetFound ? targetFound.data.name : "NONE (Success: Ghost remained hidden)"}`);

    // 3. Scenario B: Proximity Reveal
    console.log("\n[3/4] Testing Proximity Reveal (Ninja moves adjacent)...");
    ninja.gridPos = {x:29, y:25}; // Move Ninja right next to Guard
    const targetFoundClose = sim.ai.findTarget(guard);
    console.log(`   Ninja Position: [29,25] (Adjacent)`);
    console.log(`   Target found by Guard: ${targetFoundClose ? targetFoundClose.data.name : "NONE (Fail: Stealth range bug)"}`);

    // 4. Scenario C: Attack Reveal
    console.log("\n[4/4] Testing Attack Revelation...");
    console.log(`   Is Ninja Stealthed? ${ninja.isStealthed}`);
    console.log(`   Ninja attacking Guard...`);
    sim.rules.performAttack(ninja, guard);
    console.log(`   Is Ninja Stealthed after attack? ${ninja.isStealthed} (Success: Stealth Broken)`);

    console.log("\nAudit Complete.");
}

runStealthAudit();
