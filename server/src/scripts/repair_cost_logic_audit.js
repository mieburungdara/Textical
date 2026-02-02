const resolver = require('../logic/economy/RepairCostResolver');

async function runRepairCostAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING REPAIR COST LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Common Sword (100 base), 50% broken
    const common = {
        template: { baseValue: 100 },
        powerScale: 1.0,
        currentDurability: 50,
        maxDurability: 100
    };
    const costCommon = resolver.resolveCost(common);
    console.log(`[1/2] Common Sword (50% broken): ${costCommon} Silver (Expected: 25)`);
    // Math: 100 * 1.0 * 0.5 * 0.5 = 25

    // 2. Masterwork Sword (100 base, 1.3x), 90% broken
    const master = {
        template: { baseValue: 100 },
        powerScale: 1.3,
        currentDurability: 10,
        maxDurability: 100
    };
    const costMaster = resolver.resolveCost(master);
    console.log(`[2/2] Masterwork Sword (90% broken): ${costMaster} Silver (Expected: 59)`);
    // Math: 100 * 1.3 * 0.9 * 0.5 = 58.5 -> ceil 59

    // VERDICT
    if (costCommon === 25 && costMaster === 59) {
        console.log("\n🌟 FINAL VERDICT: REPAIR COST LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runRepairCostAudit().catch(err => console.error(err));
