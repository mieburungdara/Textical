const resolver = require('../logic/economy/TraderMasteryResolver');

async function runTraderMasteryAudit() {
    console.log("--------------------------------------------------");
    console.log("📈 STARTING TRADER MASTERY LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Beginner (0 sales)
    const mult0 = resolver.resolveTaxMultiplier(0);
    console.log(`[1/4] 0 Sales: ${mult0}x Multiplier (Expected: 1.0)`);

    // 2. Active (15 sales)
    const mult10 = resolver.resolveTaxMultiplier(15);
    console.log(`[2/4] 15 Sales: ${mult10}x Multiplier (Expected: 0.9)`);

    // 3. Professional (60 sales)
    const mult50 = resolver.resolveTaxMultiplier(60);
    console.log(`[3/4] 60 Sales: ${mult50}x Multiplier (Expected: 0.7)`);

    // 4. Legendary (150 sales)
    const mult100 = resolver.resolveTaxMultiplier(150);
    console.log(`[4/4] 150 Sales: ${mult100}x Multiplier (Expected: 0.5)`);

    // VERDICT
    if (mult0 === 1.0 && mult10 === 0.9 && mult50 === 0.7 && mult100 === 0.5) {
        console.log("\n🌟 FINAL VERDICT: TRADER MASTERY LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runTraderMasteryAudit().catch(err => console.error(err));
