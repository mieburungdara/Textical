const BattleSimulation = require('../logic/battleSimulation');
const CombatRules = require('../logic/combatRules');

async function runElementalAudit() {
    console.log("--------------------------------------------------");
    console.log("🔥 STARTING ELEMENTAL INTERACTION AUDIT");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");

    // 1. Setup Units
    const mage = sim.addUnit({ name: "Fire Mage", element: 1 }, 0, {x:10, y:10}, {attack_damage: 50, defense: 0, crit_chance: 0});
    const ent = sim.addUnit({ name: "Wood Ent", element: 3 }, 1, {x:11, y:10}, {attack_damage: 0, defense: 0, health_max: 500});
    const golem = sim.addUnit({ name: "Water Spirit", element: 2 }, 1, {x:10, y:11}, {attack_damage: 0, defense: 0, health_max: 500});

    console.log("[1/2] Testing Elemental Damage multipliers...");

    // Scenario A: Fire vs Nature (Weakness)
    const resA = CombatRules.calculateDamage(mage, ent, 1.0, CombatRules.ELEMENTS.FIRE);
    console.log(`   > FIRE vs NATURE: ${resA.damage} damage (Expected: 75, Mult: ${resA.elementMultiplier}x)`);

    // Scenario B: Fire vs Water (Resistance)
    const resB = CombatRules.calculateDamage(mage, golem, 1.0, CombatRules.ELEMENTS.FIRE);
    console.log(`   > FIRE vs WATER : ${resB.damage} damage (Expected: 25, Mult: ${resB.elementMultiplier}x)`);

    // Scenario C: Fire vs Fire (Neutral)
    mage.data.element = 1;
    const resC = CombatRules.calculateDamage(mage, mage, 1.0, CombatRules.ELEMENTS.FIRE);
    console.log(`   > FIRE vs FIRE  : ${resC.damage} damage (Expected: 50, Mult: ${resC.elementMultiplier}x)`);

    if (resA.elementMultiplier === 1.5 && resB.elementMultiplier === 0.5) {
        console.log("\n✅ ELEMENTAL AUDIT PASSED: Multipliers are functioning perfectly.");
    } else {
        console.log("\n❌ ELEMENTAL AUDIT FAILED: Check CombatRules.ELEMENT_CHART.");
    }
}

runElementalAudit();
