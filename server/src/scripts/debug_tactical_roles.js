const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');

async function runRoleAudit() {
    console.log("--------------------------------------------------");
    console.log("🎭 STARTING TACTICAL ROLE AUDIT");
    console.log("--------------------------------------------------\n");

    traitService._loadTraits();

    const sim = new BattleSimulation(50, 50, "ARENA");

    // PROPER STATS FOR AUDIT
    const heroStats = { health_max: 500, attack_damage: 10, defense: 0, accuracy: 100, speed: 0 };
    const mageStats = { health_max: 50, attack_damage: 10, defense: 0, accuracy: 100, speed: 0 };
    const orcStats = { health_max: 100, attack_damage: 100, defense: 0, accuracy: 100, speed: 0 };

    // 1. VANGUARD TEST
    console.log("[1/2] Testing Vanguard (The Protector)...");
    const knight = sim.addUnit({ instance_id: "k", name: "Knight", traits: ["vanguard"] }, 0, {x:25, y:25}, heroStats);
    const fragile = sim.addUnit({ instance_id: "f", name: "Mage", team: 0 }, 0, {x:26, y:25}, mageStats);
    const enemy = sim.addUnit({ instance_id: "e", name: "Orc", team: 1 }, 1, {x:27, y:25}, orcStats);

sim.units.forEach(u => traitService.executeHook("onBattleStart", u, sim));
sim.logger.startTick(1);
    
    console.log(`   Initial Knight HP: ${knight.currentHealth}`);
    sim.rules.performAttack(enemy, fragile); 
    console.log(`   Knight HP after protecting: ${knight.currentHealth} (Expected: < 500)`);

    // 2. DISRUPTOR TEST
    console.log("\n[2/2] Testing Disruptor (Slipstream)...");
    const rogueStats = { health_max: 100, attack_damage: 10, defense: 0, accuracy: 100, speed: 10 };
    const rogue = sim.addUnit({ instance_id: "r", name: "Shadow", traits: ["disruptor"] }, 0, {x:10, y:10}, rogueStats);
    const blocker = sim.addUnit({ instance_id: "b", name: "Blocker", team: 1 }, 1, {x:11, y:10}, heroStats);
    const target = { gridPos: {x:15, y:10} };

sim.logger.startTick(2);
    console.log(`   Shadow Position before: [${rogue.gridPos.x}, ${rogue.gridPos.y}]`);
    sim.ai.moveTowards(rogue, target);
    console.log(`   Shadow Position after move: [${rogue.gridPos.x}, ${rogue.gridPos.y}]`);

    const vanguardSuccess = knight.currentHealth < 500;
    const disruptorSuccess = rogue.gridPos.x === 11;

    if (vanguardSuccess && disruptorSuccess) {
        console.log("\n✅ TACTICAL ROLE AUDIT PASSED: Roles are fully functional.");
    } else {
        console.log(`\n❌ AUDIT FAILED: Vanguard=${vanguardSuccess}, Disruptor=${disruptorSuccess}`);
    }
}

runRoleAudit().catch(err => console.error(err));