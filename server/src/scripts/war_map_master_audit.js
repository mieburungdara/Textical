const regionController = require('../controllers/RegionController');
const prisma = require('../db');

async function runWarMapAudit() {
    console.log("--------------------------------------------------");
    console.log("🔥 STARTING WAR MAP UI INTEGRATION AUDIT");
    console.log("--------------------------------------------------\n");

    const regionId = 1;

    // 1. Setup: Trigger a Skirmish in Region 1
    console.log("[1/2] Triggering Frontline Skirmish in Region 1...");
    await prisma.activeEvent.deleteMany({ where: { regionId, templateId: 10 } });
    await prisma.activeEvent.create({
        data: {
            regionId, templateId: 10,
            expiresAt: new Date(Date.now() + 3600000) // 1 hour
        }
    });

    // 2. Mock Request/Response
    const req = {};
    let responseData = null;
    const res = {
        status: () => res,
        json: (data) => { responseData = data; return res; }
    };

    // 3. Call Controller
    console.log("[2/2] Verifying API payload for War Map...");
    await regionController.getGlobalInfluence(req, res);

    const region = responseData.data.find(r => r.id === regionId);
    const hasSkirmish = region.activeEvents.some(ae => ae.templateId === 10);
    const hasInfluence = region.influence.length > 0;

    console.log(`   Region 1 Skirmish Detected: ${hasSkirmish ? 'YES' : 'NO'}`);
    console.log(`   Region 1 Influence Data Found: ${hasInfluence ? 'YES' : 'NO'}`);

    // VERDICT
    if (hasSkirmish && hasInfluence) {
        console.log("\n🌟 FINAL VERDICT: WAR MAP UI INTEGRATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: UI DATA SYNC FAILURE.");
    }

    // Cleanup
    await prisma.activeEvent.deleteMany({ where: { regionId, templateId: 10 } });
    console.log("\n--------------------------------------------------");
}

runWarMapAudit().catch(err => console.error(err));
