const replayService = require('../services/battle/ReplayService');
const { v4: uuidv4 } = require('uuid');

async function runReplayAudit() {
    console.log("--------------------------------------------------");
    console.log("📼 STARTING REPLAY STORAGE AUDIT");
    console.log("--------------------------------------------------\n");

    const battleId = uuidv4();
    const dummyLogs = [
        { tick: 0, events: [{ type: "INIT", msg: "Battle Started" }] },
        { tick: 1, events: [{ type: "MOVE", msg: "Unit moved" }] }
    ];

    // 1. Save Replay
    console.log(`[1/2] Saving replay for Battle ID: ${battleId}...`);
    await replayService.saveReplay(battleId, dummyLogs);
    console.log("   ✅ Replay saved.");

    // 2. Retrieve Replay
    console.log(`[2/2] Retrieving replay...`);
    const retrieved = await replayService.getReplay(battleId);
    
    if (retrieved && retrieved.length === 2 && retrieved[0].events[0].msg === "Battle Started") {
        console.log("   ✅ Replay retrieved successfully.");
        console.log(`   Content Check: ${JSON.stringify(retrieved[0])}`);
    } else {
        console.error("   ❌ Failed to retrieve correct replay data.");
        console.error("   Got:", retrieved);
    }

    console.log("\n--------------------------------------------------");
}

runReplayAudit().catch(err => console.error(err));
