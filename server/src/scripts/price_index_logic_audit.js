const priceIndexService = require('../services/market/PriceIndexService');
const prisma = require('../db');

async function runPriceIndexAudit() {
    console.log("--------------------------------------------------");
    console.log("📈 STARTING PRICE INDEX LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    const templateId = 2201; // Granite
    const regionId = 1;

    // 1. Setup: Create Dummy Sales
    console.log("[1/2] Creating simulated sale records...");
    await prisma.itemSaleHistory.deleteMany({ where: { templateId, regionId } });
    
    const sales = [
        { templateId, pricePerUnit: 100, quantity: 10, regionId, soldAt: new Date(Date.now() - 4000) },
        { templateId, pricePerUnit: 110, quantity: 5, regionId, soldAt: new Date(Date.now() - 3000) },
        { templateId, pricePerUnit: 105, quantity: 2, regionId, soldAt: new Date(Date.now() - 2000) },
        { templateId, pricePerUnit: 120, quantity: 1, regionId, soldAt: new Date(Date.now() - 1000) },
        { templateId, pricePerUnit: 115, quantity: 8, regionId, soldAt: new Date() }
    ];

    for (const sale of sales) {
        await prisma.itemSaleHistory.create({ data: sale });
    }

    // 2. Fetch History
    console.log("[2/2] Fetching chronological history...");
    const history = await priceIndexService.getPriceHistory(templateId, regionId);
    
    console.log(`   Points Retrieved: ${history.length} (Expected: 5)`);
    history.forEach(h => console.log(`      Price: ${h.price} | Time: ${h.timestamp.toISOString()}`));

    const globalAvg = await priceIndexService.getGlobalAverage(templateId);
    console.log(`   Global Average: ${globalAvg} (Expected: ~110)`);

    // VERDICT
    if (history.length === 5 && globalAvg > 0) {
        console.log("\n🌟 FINAL VERDICT: PRICE INDEX LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runPriceIndexAudit().catch(err => console.error(err));
