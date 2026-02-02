const resolver = require('../logic/economy/TaxRateResolver');

async function runTaxResolverAudit() {
    console.log("--------------------------------------------------");
    console.log("📈 STARTING TAX RATE RESOLVER AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Test Base (Peace, No Infra)
    const base = resolver.resolve(false, 0);
    console.log(`   Base Rate (Peace): ${base * 100}% (Expected: 10%)`);

    // 2. Test War Penalty
    const war = resolver.resolve(true, 0);
    console.log(`   War Rate: ${war * 100}% (Expected: 15%)`);

    // 3. Test Infrastructure Bonus (Reduction)
    const infra = resolver.resolve(false, 0.03); // 3% reduction
    console.log(`   Infra Rate (3% reduction): ${infra * 100}% (Expected: 7%)`);

    // 4. Test Combined
    const combined = resolver.resolve(true, 0.05); // 5% reduction during war
    console.log(`   Combined Rate (War + 5% reduction): ${combined * 100}% (Expected: 10%)`);

    // VERDICT
    if (base === 0.10 && war === 0.15 && infra === 0.07 && combined === 0.10) {
        console.log("\n🌟 FINAL VERDICT: TAX RATE RESOLVER PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runTaxResolverAudit().catch(err => console.error(err));
