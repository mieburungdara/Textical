const resolver = require('../../sim/OracleTravelResolver');

async function runOracleTravelAudit() {
    console.log("--------------------------------------------------");
    console.log("✈️ STARTING ORACLE TRAVEL LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    const defaultTown = { id: 1, specialization: null, regionalTaxRate: 0.15 };
    const blacksmithHub = { id: 2, specialization: "BLACKSMITH_HUB", regionalTaxRate: 0.15 };
    const highTaxTown = { id: 3, specialization: null, regionalTaxRate: 0.25 };

    // 1. Crafter Preference
    const scoreCrafterDefault = resolver.scoreRegion(defaultTown, "CRAFTER");
    const scoreCrafterHub = resolver.scoreRegion(blacksmithHub, "CRAFTER");
    console.log(`[1/3] Crafter Scores: Default=${scoreCrafterDefault}, Hub=${scoreCrafterHub} (Expected Hub > Default)`);

    // 2. Migration Decision
    const shouldMove = resolver.shouldMigrate(scoreCrafterDefault, scoreCrafterHub);
    console.log(`[2/3] Should Crafter Migrate? ${shouldMove} (Expected: true)`);

    // 3. Tax Impact
    const scoreDefault = resolver.scoreRegion(defaultTown, "WARRIOR");
    const scoreHighTax = resolver.scoreRegion(highTaxTown, "WARRIOR");
    console.log(`[3/3] Tax Impact (Warrior): Default=${scoreDefault}, HighTax=${scoreHighTax} (Expected Default > HighTax)`);

    // VERDICT
    if (scoreCrafterHub > scoreCrafterDefault && shouldMove && scoreDefault > scoreHighTax) {
        console.log("\n🌟 FINAL VERDICT: ORACLE TRAVEL LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runOracleTravelAudit().catch(err => console.error(err));
