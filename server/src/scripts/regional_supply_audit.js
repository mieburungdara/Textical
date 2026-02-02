const resolver = require('../logic/economy/RegionalSupplyResolver');

async function runRegionalSupplyAudit() {
    console.log("--------------------------------------------------");
    console.log("📊 STARTING REGIONAL SUPPLY AUDIT");
    console.log("--------------------------------------------------\n");

    const itemOre = { id: 2101, category: "MATERIAL", name: "Iron Ore" };
    const itemSword = { id: 7001, category: "EQUIPMENT", name: "Bronze Sword" };

    const regionMine = {
        id: 2, name: "Iron Mine", dangerLevel: 2, zoneType: "GREEN",
        resources: [{ itemId: 2101 }]
    };

    const regionForbidden = {
        id: 5, name: "Forbidden Grove", dangerLevel: 8, zoneType: "RED",
        resources: []
    };

    // 1. Test Resource Synergy
    console.log("[1/3] Testing Resource Synergy (Iron Ore in Mine)...");
    const multOre = resolver.calculateMultiplier(regionMine, itemOre);
    console.log(`   Multiplier: ${multOre} (Expected: 1.5)`);

    // 2. Test Danger Level (Equipment in Dangerous Zone)
    console.log("[2/3] Testing Danger Level (Sword in Forbidden Grove)...");
    const multSword = resolver.calculateMultiplier(regionForbidden, itemSword);
    // Base 1.0 + 0.2 (Danger) * 0.8 (RED Zone) = 0.96
    console.log(`   Multiplier: ${multSword} (Expected: ~0.96)`);

    // 3. Test Supply Scarcity (Material in Dangerous/RED Zone)
    console.log("[3/3] Testing Supply Scarcity (Ore in Forbidden Grove)...");
    const multOreScarcity = resolver.calculateMultiplier(regionForbidden, itemOre);
    // Base 1.0 - 0.3 (Danger) * 0.8 (RED Zone) = 0.56
    console.log(`   Multiplier: ${multOreScarcity} (Expected: ~0.56)`);

    // VERDICT
    if (multOre === 1.5 && multSword < 1.0 && multOreScarcity < 0.6) {
        console.log("\n🌟 FINAL VERDICT: REGIONAL SUPPLY LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC CALCULATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runRegionalSupplyAudit().catch(err => console.error(err));
