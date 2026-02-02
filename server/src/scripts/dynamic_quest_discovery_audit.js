const npcService = require('../services/npcService');
const questService = require('../services/economy/MerchantQuestService');
const prisma = require('../db');

async function runDiscoveryAudit() {
    console.log("--------------------------------------------------");
    console.log("🔍 STARTING DYNAMIC QUEST DISCOVERY AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const regionId = 1;
    const npcId = 11; // Zev

    // 1. Setup: Generate Quest
    console.log("[1/2] Generating dynamic quest for Zev...");
    await prisma.shopStock.update({
        where: { npcId_regionId_templateId: { npcId, regionId, templateId: 4425 } },
        data: { quantity: 0 } // Total shortage
    });
    await questService.generateShortageQuests();

    // 2. Discover via NPC Service
    console.log("[2/2] Fetching NPCs in Region 1...");
    const npcs = await npcService.getAvailableNPCs(regionId, userId);
    
    const zev = npcs.find(n => n.templateId === npcId);
    console.log(`   NPC: ${zev ? zev.name : 'NOT FOUND'}`);
    
    if (zev) {
        console.log(`   Options: ${zev.interactionOptions.join(', ')}`);
        const hasDynamic = zev.interactionOptions.includes("DYNAMIC_QUEST");
        console.log(`   Has Dynamic Quest Option: ${hasDynamic ? 'YES' : 'NO'}`);
    }

    // VERDICT
    if (zev && zev.interactionOptions.includes("DYNAMIC_QUEST")) {
        console.log("\n🌟 FINAL VERDICT: DYNAMIC QUEST DISCOVERY PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: DISCOVERY FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runDiscoveryAudit().catch(err => console.error(err));
