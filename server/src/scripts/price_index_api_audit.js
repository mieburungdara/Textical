const marketController = require('../controllers/MarketController');
const prisma = require('../db');

async function runPriceIndexApiAudit() {
    console.log("--------------------------------------------------");
    console.log("🌐 STARTING PRICE INDEX API AUDIT");
    console.log("--------------------------------------------------\n");

    const templateId = 2201; // Granite

    // 1. Mock Request/Response
    const req = { params: { templateId }, query: {} };
    let responseData = null;
    const res = {
        status: () => res,
        json: (data) => { responseData = data; return res; }
    };

    // 2. Call Controller
    console.log(`[1/1] Calling MarketController.getPriceIndex(${templateId})...`);
    await marketController.getPriceIndex(req, res);

    if (responseData && responseData.success && Array.isArray(responseData.data)) {
        console.log(`   ✅ API returned ${responseData.data.length} price points.`);
        if (responseData.data.length > 0) {
            console.log(`   ✅ First point: Price ${responseData.data[0].price} at ${responseData.data[0].timestamp}`);
        }
        console.log("\n🌟 FINAL VERDICT: PRICE INDEX API OPERATIONAL.");
    } else {
        console.error("   ❌ API failed to return data.");
        console.error("   Response:", responseData);
    }

    console.log("\n--------------------------------------------------");
}

runPriceIndexApiAudit().catch(err => console.error(err));
