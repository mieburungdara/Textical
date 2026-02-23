const resolver = require('../logic/guild/SiegeFortificationResolver');

async function runFortificationAudit() {
    console.log("--------------------------------------------------");
    console.log("🏰 STARTING FORTIFICATION LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    const maxFort = 1000;

    // 1. Damage Calculation
    const damage = resolver.resolveDamage(maxFort);
    console.log(`[1/2] Damage for 1000 Max Fortification: ${damage} (Expected: 100)`);

    // 2. Repair Cost Calculation
    const repairCost = resolver.resolveRepairCost(100);
    console.log(`[2/2] Cost to repair 100 points: ${repairCost} Silver (Expected: 10,000)`);

    // VERDICT
    if (damage === 100 && repairCost === 10000) {
        console.log("\n🌟 FINAL VERDICT: FORTIFICATION LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runFortificationAudit().catch(err => console.error(err));
