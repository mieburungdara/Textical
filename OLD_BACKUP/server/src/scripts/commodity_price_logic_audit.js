const resolver = require('../logic/economy/CommodityPriceResolver');

async function runPriceLogicAudit() {
    console.log("--------------------------------------------------");
    console.log("📈 STARTING COMMODITY PRICE LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Scarcity (0 volume)
    const scarcityMax = resolver.resolveMultiplier(0);
    console.log(`   Scarcity (0 units): ${scarcityMax}x (Expected: 1.5)`);

    // 2. Scarcity (Partial)
    const scarcityMid = resolver.resolveMultiplier(25);
    console.log(`   Scarcity (25 units): ${scarcityMid}x (Expected: 1.25)`);

    // 3. Normal (Base threshold)
    const normal = resolver.resolveMultiplier(50);
    console.log(`   Normal (50 units): ${normal}x (Expected: 1.0)`);

    // 4. Surplus
    const surplus = resolver.resolveMultiplier(150);
    console.log(`   Surplus (150 units): ${surplus}x (Expected: 0.9)`);

    // 5. Hard Cap Surplus
    const cap = resolver.resolveMultiplier(1000);
    console.log(`   Surplus Cap (1000 units): ${cap}x (Expected: 0.8)`);

    // VERDICT
    if (scarcityMax === 1.5 && scarcityMid === 1.25 && normal === 1.0 && surplus === 0.9 && cap === 0.8) {
        console.log("\n🌟 FINAL VERDICT: COMMODITY PRICE LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC CALCULATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runPriceLogicAudit().catch(err => console.error(err));
