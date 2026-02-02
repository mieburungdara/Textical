const detector = require('../logic/economy/ShortageDetector');

async function runShortageAudit() {
    console.log("--------------------------------------------------");
    console.log("📉 STARTING SHORTAGE DETECTOR AUDIT");
    console.log("--------------------------------------------------\n");

    const stocks = [
        { npcId: 1, regionId: 1, templateId: 2101, quantity: 2, maxQuantity: 50 }, // 4% -> Shortage
        { npcId: 1, regionId: 1, templateId: 2201, quantity: 45, maxQuantity: 50 } // 90% -> OK
    ];

    console.log("[1/1] Scanning stock records...");
    const shortages = detector.detect(stocks);

    console.log(`   Shortages Detected: ${shortages.length}`);
    shortages.forEach(s => {
        console.log(`      Item ${s.templateId}: Qty ${s.currentQty}/${s.maxQty} | Severity: ${s.severity.toFixed(2)}`);
    });

    // VERDICT
    if (shortages.length === 1 && shortages[0].templateId === 2101) {
        console.log("\n🌟 FINAL VERDICT: SHORTAGE DETECTION LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: DETECTION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runShortageAudit().catch(err => console.error(err));
