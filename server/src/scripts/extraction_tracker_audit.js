const service = require('../services/economy/ExtractionTrackerService');
const prisma = require('../db');

async function runExtractionAudit() {
    console.log("--------------------------------------------------");
    console.log("⛏️ STARTING EXTRACTION TRACKER AUDIT");
    console.log("--------------------------------------------------\n");

    const regionId = 1;
    const templateId = 2005; // Iron Ingot

    // 0. Setup: Clean state
    console.log("[0/2] Preparing environment...");
    await prisma.regionalExtractionStats.deleteMany({ where: { regionId, templateId } });

    // 1. Record First Extraction
    console.log("[1/2] Recording first extraction (10 units)...");
    await service.recordExtraction(regionId, templateId, 10);
    
    let stats = await service.getStats(regionId, templateId);
    console.log(`   Volume after first record: ${stats.volume24h} (Expected: 10)`);

    // 2. Increment Extraction
    console.log("[2/2] Recording second extraction (+5 units)...");
    await service.recordExtraction(regionId, templateId, 5);
    
    stats = await service.getStats(regionId, templateId);
    console.log(`   Volume after second record: ${stats.volume24h} (Expected: 15)`);

    // VERDICT
    if (stats && stats.volume24h === 15) {
        console.log("\n🌟 FINAL VERDICT: EXTRACTION TRACKER PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: TRACKING FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runExtractionAudit().catch(err => console.error(err));
