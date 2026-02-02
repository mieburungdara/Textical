const resolver = require('../logic/economy/CurrencyResolver');

async function runCurrencyAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING CURRENCY RESOLVER AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Decompose Total Copper
    // 1,001,001,001,001 Copper should be:
    // 1 Diamond, 1 Platinum, 1 Gold, 1 Silver, 1 Copper
    const total = 1001001001001; 
    console.log(`[1/2] Decomposing ${total} Copper...`);
    
    const tiers = resolver.resolveTiers(total);
    console.log(`   Diamond: ${tiers.diamond}`);
    console.log(`   Platinum: ${tiers.platinum}`);
    console.log(`   Gold: ${tiers.gold}`);
    console.log(`   Silver: ${tiers.silver}`);
    console.log(`   Copper: ${tiers.copper}`);

    // 2. Recompose back to Total
    console.log("\n[2/2] Recomposing tiers back to Copper...");
    const backToTotal = resolver.getTotalCopper(tiers);
    console.log(`   Result: ${backToTotal} (Expected: ${total})`);

    // VERDICT
    const decomposePass = tiers.diamond === 1 && tiers.platinum === 1 && tiers.gold === 1 && tiers.silver === 1 && tiers.copper === 1;
    const recomposePass = backToTotal === total;

    if (decomposePass && recomposePass) {
        console.log("\n🌟 FINAL VERDICT: CURRENCY RESOLVER PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MATH LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runCurrencyAudit().catch(err => console.error(err));
