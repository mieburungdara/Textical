const resolver = require('../logic/crafting/AffixResolver');

async function runAffixAudit() {
    console.log("--------------------------------------------------");
    console.log("💎 STARTING AFFIX RESOLVER AUDIT");
    console.log("--------------------------------------------------\n");

    const fireEssenceId = 3001;
    const resolvedTrait = resolver.resolveTraitId(fireEssenceId);
    const suffix = resolver.getSuffix(resolvedTrait);

    console.log(`   Material ID: ${fireEssenceId}`);
    console.log(`   Resolved Trait ID: ${resolvedTrait} (Expected: 1)`);
    console.log(`   Generated Suffix: ${suffix} (Expected: of Embers)`);

    // VERDICT
    if (resolvedTrait === 1 && suffix === "of Embers") {
        console.log("\n🌟 FINAL VERDICT: AFFIX RESOLVER LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runAffixAudit().catch(err => console.error(err));
