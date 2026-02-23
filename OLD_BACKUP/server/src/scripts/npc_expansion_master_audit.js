const npcService = require('../services/npcService');
const prisma = require('../db');

async function runNPCExpansionAudit() {
    console.log("--------------------------------------------------");
    console.log("👥 STARTING NPC EXPANSION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39; // Arthur
    
    // NPC IDs
    const gortonId = 21; // Gambler
    const zephyrId = 24;  // Teleporter
    const elaraId = 27;  // Buffer

    // 0. Setup User Gold & Position
    console.log("[0/4] Initializing User (Gold: 5000, Region: 1)...");
    await prisma.user.update({
        where: { id: userId },
        data: { gold: 5000, currentRegion: 1 }
    });

    // 1. Test Buff: Priestess Elara
    console.log("[1/4] Interacting with Priestess Elara (BUFF)...");
    const buffRes = await npcService.interactWithNPC(userId, heroId, elaraId, "BUFF");
    console.log(`   Result: ${buffRes.message}`);

    // 2. Test Gamble: Gorton the Bold
    console.log("[2/4] Interacting with Gorton (GAMBLE 500 gold)...");
    const gambleRes = await npcService.interactWithNPC(userId, heroId, gortonId, "GAMBLE", { betAmount: 500 });
    console.log(`   Result: ${gambleRes.message} (New Balance: ${gambleRes.newBalance})`);

    // 3. Test Teleport: Zephyr
    console.log("[3/4] Interacting with Zephyr (TELEPORT to Region 2)...");
    const teleRes = await npcService.interactWithNPC(userId, heroId, zephyrId, "TELEPORT", { destinationId: 2 });
    console.log(`   Result: ${teleRes.message}`);

    // 4. Verify Final State
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    const activeBuffs = await prisma.heroBuff.findMany({ where: { heroId, name: "Sun's Grace" } });

    console.log(`\n📊 FINAL AUDIT CHECK:`);
    console.log(`   Current Region: ${updatedUser.currentRegion} (Expected: 2)`);
    console.log(`   Buff Active: ${activeBuffs.length > 0 ? 'YES' : 'NO'} (Expected: YES)`);

    if (updatedUser.currentRegion === 2 && activeBuffs.length > 0) {
        console.log("\n🌟 FINAL VERDICT: NPC EXPANSION FULLY OPERATIONAL.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runNPCExpansionAudit().catch(err => console.error(err));
