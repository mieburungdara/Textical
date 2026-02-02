const resolver = require('../logic/crafting/StationBuffResolver');

async function runStationBuffAudit() {
    console.log("--------------------------------------------------");
    console.log("🛠️ STARTING STATION BUFF RESOLVER AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Normal (Low volume)
    const normal = resolver.resolveSpeedMultiplier(50);
    console.log(`   Normal (50 units): ${normal}x (Expected: 1.0)`);

    // 2. Low Surplus
    const lowSurplus = resolver.resolveSpeedMultiplier(150);
    console.log(`   Low Surplus (150 units): ${lowSurplus}x (Expected: 0.9)`);

    // 3. High Surplus
    const highSurplus = resolver.resolveSpeedMultiplier(600);
    console.log(`   High Surplus (600 units): ${highSurplus}x (Expected: 0.7)`);

    // VERDICT
    if (normal === 1.0 && lowSurplus === 0.9 && highSurplus === 0.7) {
        console.log("\n🌟 FINAL VERDICT: STATION BUFF RESOLVER PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runStationBuffAudit().catch(err => console.error(err));
