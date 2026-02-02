const resolver = require('../logic/world/EnvironmentalResolver');

async function runEnvironmentalAudit() {
    console.log("--------------------------------------------------");
    console.log("🌦️ STARTING ENVIRONMENTAL LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Day + Rain
    const rain = resolver.resolveModifiers(12, "RAIN");
    console.log(`[1/3] Day 12:00 + RAIN:`)
    console.log(`   Fishing Yield Mult: ${rain.gathering.fishingYieldMult}x (Expected: 1.5)`);
    console.log(`   Fire Damage Mult: ${rain.combat.fireMult}x (Expected: 0.8)`);

    // 2. Night + Storm
    const storm = resolver.resolveModifiers(2, "STORM");
    console.log(`\n[2/3] Night 02:00 + STORM:`)
    console.log(`   Global ATK Mult: ${storm.combat.atkMult.toFixed(2)}x (Expected: 0.99)`); // 1.1 (Night) * 0.9 (Storm) = 0.99
    console.log(`   Travel Speed Mult: ${storm.travel.speedMult}x (Expected: 0.7)`);

    // 3. Heatwave
    const heat = resolver.resolveModifiers(14, "HEATWAVE");
    console.log(`\n[3/3] Day 14:00 + HEATWAVE:`)
    console.log(`   Gathering Speed Mult: ${heat.gathering.speedMult}x (Expected: 0.7)`);
    console.log(`   Fire Damage Mult: ${heat.combat.fireMult}x (Expected: 1.3)`);

    // VERDICT
    if (rain.gathering.fishingYieldMult === 1.5 && storm.travel.speedMult === 0.7 && heat.combat.fireMult === 1.3) {
        console.log("\n🌟 FINAL VERDICT: ENVIRONMENTAL LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runEnvironmentalAudit().catch(err => console.error(err));
