const battleController = require('../controllers/BattleController');
const replayService = require('../services/battle/ReplayService');
const { v4: uuidv4 } = require('uuid');

async function runApiAudit() {
    console.log("--------------------------------------------------");
    console.log("🌐 STARTING REPLAY API AUDIT");
    console.log("--------------------------------------------------\n");

    const battleId = uuidv4();
    const dummyLogs = [{ tick: 0, msg: "API Test" }];

    // 1. Setup Replay Data
    await replayService.saveReplay(battleId, dummyLogs);

    // 2. Mock Request/Response
    const req = { params: { battleId } };
    let responseData = null;
    const res = {
        status: () => res,
        json: (data) => { responseData = data; return res; }
    };

    // 3. Call Controller
    console.log(`[1/1] Calling BattleController.getReplay('${battleId}')...`);
    await battleController.getReplay(req, res);

    if (responseData && responseData.data && responseData.data[0].msg === "API Test") {
        console.log("   ✅ API returned correct replay data.");
        console.log("\n🌟 FINAL VERDICT: REPLAY API OPERATIONAL.");
    } else {
        console.error("   ❌ API failed to return data.");
        console.error("   Response:", responseData);
    }

    console.log("\n--------------------------------------------------");
}

runApiAudit().catch(err => console.error(err));
