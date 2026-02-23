const resolver = require('../logic/economy/CurrencyResolver');

async function runDualCurrencyAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING DUAL-CURRENCY RESOLVER AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Decompose Total Silver
    // 1,500,000 Silver should be: 1 Gold, 500,000 Silver
    const total = 1500000; 
    console.log(`[1/2] Decomposing ${total} Silver...`);
    
    const tiers = resolver.resolveTiers(total);
    console.log(`   Gold: ${tiers.gold}`);
    console.log(`   Silver: ${tiers.silver}`);

    // 2. Recompose back to Total
    console.log("\n[2/2] Recomposing tiers back to Silver...");
    const backToTotal = resolver.getTotalSilver(tiers);
    console.log(`   Result: ${backToTotal} (Expected: ${total})`);

    // VERDICT
    const decomposePass = tiers.gold === 1 && tiers.silver === 500000;
    const recomposePass = backToTotal === total;

    if (decomposePass && recomposePass) {
        console.log("\n🌟 FINAL VERDICT: DUAL-CURRENCY RESOLVER PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MATH LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runDualCurrencyAudit().catch(err => console.error(err));
