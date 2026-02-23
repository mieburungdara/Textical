const resolver = require('../logic/crafting/StationBuffResolver');

async function runStationBuffAudit() {
    console.log("--------------------------------------------------");
    console.log("🛠️ STARTING STATION BUFF LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Blacksmith Hub - Crafting Equipment
    const forgeBuffs = resolver.resolveBuffs("BLACKSMITH_HUB", "EQUIPMENT");
    console.log(`[1/3] BLACKSMITH_HUB +EQUIPMENT: Speed=${forgeBuffs.speedMult}x, Luck=${forgeBuffs.qualityLuck} (Expected: 0.8x, 0.1)`);

    // 2. Blacksmith Hub - Crafting Consumable (Should be default)
    const missBuffs = resolver.resolveBuffs("BLACKSMITH_HUB", "CONSUMABLE");
    console.log(`[2/3] BLACKSMITH_HUB + CONSUMABLE: Speed=${missBuffs.speedMult}x, Luck=${missBuffs.qualityLuck} (Expected: 1.0x, 0.0)`);

    // 3. No Specialization
    const defaultBuffs = resolver.resolveBuffs(null, "EQUIPMENT");
    console.log(`[3/3] NO SPECIALIZATION: Speed=${defaultBuffs.speedMult}x, Luck=${defaultBuffs.qualityLuck} (Expected: 1.0x, 0.0)`);

    // VERDICT
    if (forgeBuffs.speedMult === 0.8 && missBuffs.speedMult === 1.0 && defaultBuffs.speedMult === 1.0) {
        console.log("\n🌟 FINAL VERDICT: STATION BUFF LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runStationBuffAudit().catch(err => console.error(err));
