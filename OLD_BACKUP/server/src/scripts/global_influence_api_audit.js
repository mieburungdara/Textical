const regionController = require('../controllers/RegionController');
const prisma = require('../db');

async function runInfluenceApiAudit() {
    console.log("--------------------------------------------------");
    console.log("🌐 STARTING GLOBAL INFLUENCE API AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Mock Request/Response
    const req = {};
    let responseData = null;
    const res = {
        status: () => res,
        json: (data) => { responseData = data; return res; }
    };

    // 2. Call Controller
    console.log("[1/1] Calling RegionController.getGlobalInfluence()...");
    await regionController.getGlobalInfluence(req, res);

    if (responseData && responseData.success && Array.isArray(responseData.data)) {
        console.log(`   ✅ API returned ${responseData.data.length} regions.`);
        
        // Sample Check
        const sample = responseData.data[0];
        if (sample && sample.influence !== undefined && sample.activeEvents !== undefined) {
            console.log(`   ✅ Sample Region (ID: ${sample.id}) has influence and event arrays.`);
            console.log(`      Influence Count: ${sample.influence.length}`);
            console.log(`      Event Count: ${sample.activeEvents.length}`);
        }

        console.log("\n🌟 FINAL VERDICT: GLOBAL INFLUENCE API OPERATIONAL.");
    } else {
        console.error("   ❌ API failed to return structured region data.");
        console.error("   Response:", responseData);
    }

    console.log("\n--------------------------------------------------");
}

runInfluenceApiAudit().catch(err => console.error(err));
