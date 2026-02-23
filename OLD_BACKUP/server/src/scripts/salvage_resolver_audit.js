const resolver = require('../logic/crafting/SalvageResolver');

async function runSalvageResolverAudit() {
    console.log("--------------------------------------------------");
    console.log("♻️ STARTING SALVAGE RESOLVER AUDIT");
    console.log("--------------------------------------------------\n");

    const mockRecipe = {
        ingredients: [
            { itemId: 2005, quantity: 10 } // Iron Ingot
        ]
    };

    // 1. Base Return (30%)
    const base = resolver.resolveReturns(mockRecipe, "COMMON");
    console.log(`[1/2] Base Return (10 Iron): ${base[0].quantity} units (Expected: 3)`);

    // 2. High Quality Weighting
    // Testing weight logic, not the random roll
    const weightRare = resolver._getQualityWeight("RARE");
    const weightMaster = resolver._getQualityWeight("MASTERWORK");
    console.log(`
[2/2] Quality Weights:`);
    console.log(`   RARE: ${weightRare} (Expected: 1)`);
    console.log(`   MASTERWORK: ${weightMaster} (Expected: 2)`);

    // VERDICT
    if (base[0].quantity === 3 && weightRare === 1 && weightMaster === 2) {
        console.log("\n🌟 FINAL VERDICT: SALVAGE RESOLVER PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runSalvageResolverAudit().catch(err => console.error(err));
