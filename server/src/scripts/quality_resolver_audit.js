const resolver = require('../logic/crafting/QualityResolver');

async function runQualityResolverAudit() {
    console.log("--------------------------------------------------");
    console.log("💎 STARTING QUALITY RESOLVER AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Test COMMON (Low level, low surplus)
    const common = resolver.resolve(10, 50);
    console.log(`   Level 10, Vol 50: Quality=${common.quality}, Scale=${common.powerScale}x (Expected: COMMON, 1.0)`);

    // 2. Test RARE (High level, low surplus)
    const rareSkill = resolver.resolve(30, 50);
    console.log(`   Level 30, Vol 50: Quality=${rareSkill.quality}, Scale=${rareSkill.powerScale}x (Expected: RARE, 1.15)`);

    // 3. Test RARE (Low level, high surplus)
    const rareSurplus = resolver.resolve(10, 600);
    console.log(`   Level 10, Vol 600: Quality=${rareSurplus.quality}, Scale=${rareSurplus.powerScale}x (Expected: RARE, 1.15)`);

    // 4. Test MASTERWORK (High level, high surplus)
    const master = resolver.resolve(60, 600);
    console.log(`   Level 60, Vol 600: Quality=${master.quality}, Scale=${master.powerScale}x (Expected: MASTERWORK, 1.3)`);

    // VERDICT
    const commonPass = common.quality === "COMMON" && common.powerScale === 1.0;
    const rarePass = rareSkill.quality === "RARE" && rareSkill.powerScale === 1.15 && rareSurplus.quality === "RARE";
    const masterPass = master.quality === "MASTERWORK" && master.powerScale === 1.3;

    if (commonPass && rarePass && masterPass) {
        console.log("\n🌟 FINAL VERDICT: QUALITY RESOLVER LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runQualityResolverAudit().catch(err => console.error(err));
