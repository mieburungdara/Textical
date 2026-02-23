const resolver = require('../logic/npc/NPCActionResolver');

async function runTraitorAudit() {
    console.log("--------------------------------------------------");
    console.log("🛡️ STARTING TRAITOR HOSTILITY AUDIT");
    console.log("--------------------------------------------------\n");

    const guardNPC = {
        id: 101, name: "City Guard", type: "GUARD", factionId: 1, description: "Protector."
    };

    const traitorRep = -1500;
    const citizenRep = 500;

    // 1. Test Traitor Interaction
    console.log("[1/2] Checking interaction for Traitor (-1500 Rep)...");
    const traitorState = await resolver.resolveFullState(guardNPC, null, 1, traitorRep);
    
    console.log(`   Dialogue: "${traitorState.dialogue}"`);
    console.log(`   Trigger Combat: ${traitorState.triggerCombat ? 'YES' : 'NO'} (Expected: YES)`);
    console.log(`   Is Hostile: ${traitorState.isHostile ? 'YES' : 'NO'} (Expected: YES)`);

    // 2. Test Citizen Interaction
    console.log("\n[2/2] Checking interaction for Citizen (500 Rep)...");
    const citizenState = await resolver.resolveFullState(guardNPC, null, 1, citizenRep);
    
    console.log(`   Dialogue: "${citizenState.dialogue}"`);
    console.log(`   Trigger Combat: ${citizenState.triggerCombat ? 'YES' : 'NO'} (Expected: NO)`);

    // VERDICT
    if (traitorState.triggerCombat && !citizenState.triggerCombat) {
        console.log("\n🌟 FINAL VERDICT: TRAITOR HOSTILITY LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: HOSTILITY LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runTraitorAudit().catch(err => console.error(err));
