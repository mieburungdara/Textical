const BattleSimulation = require('../logic/battleSimulation');

async function runResourceAudit() {
    console.log("--------------------------------------------------");
    console.log("⚡ STARTING DYNAMIC RESOURCE AUDIT");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");

    // 1. Warrior (RAGE)
    console.log("[1/2] Testing Warrior Rage Gain...");
    const warrior = sim.addUnit({
        instance_id: "war", name: "Orc Warrior", resourceType: "RAGE"
    }, 0, {x:25, y:25}, {health_max: 500, mana_max: 100, speed: 10});

    console.log(`   Initial Rage: ${warrior.currentMana}`);

    // Simulate taking 100 damage
    warrior.takeDamage(100, sim);
    console.log(`   Rage after 100 DMG taken: ${warrior.currentMana} (Expected: 10)`);

    // 2. Rogue (ENERGY)
    console.log("\n[2/2] Testing Rogue Energy Regen...");
    const rogue = sim.addUnit({
        instance_id: "rog", name: "Elf Rogue", resourceType: "ENERGY"
    }, 0, {x:26, y:25}, {health_max: 100, mana_max: 100, speed: 10});

    rogue.currentMana = 30;
    console.log(`   Energy before Turn: ${rogue.currentMana}`);
    rogue.applyRegen(sim);
    console.log(`   Energy after Turn: ${rogue.currentMana} (Expected: 50)`);

    if (warrior.currentMana === 10 && rogue.currentMana === 50) {
        console.log("\n✅ RESOURCE AUDIT PASSED: Mechanics are unique and functional.");
    } else {
        console.log("\n❌ RESOURCE AUDIT FAILED.");
    }
}

runResourceAudit().catch(err => console.error(err));
