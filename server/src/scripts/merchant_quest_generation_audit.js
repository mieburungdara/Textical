const service = require('../services/economy/MerchantQuestService');
const prisma = require('../db');

async function runQuestGenAudit() {
    console.log("--------------------------------------------------");
    console.log("📜 STARTING MERCHANT QUEST GENERATION AUDIT");
    console.log("--------------------------------------------------\n");

    const npcId = 11; // Zev
    const regionId = 1;
    const itemId = 4425;

    // 1. Setup Shortage (Qty 1 / Max 50)
    console.log("[1/2] Creating artificial shortage...");
    await prisma.shopStock.upsert({
        where: { npcId_regionId_templateId: { npcId, regionId, templateId: itemId } },
        update: { quantity: 1, maxQuantity: 50 },
        create: { npcId, regionId, templateId: itemId, quantity: 1, maxQuantity: 50, nextRestock: new Date() }
    });

    // 2. Generate Quests
    console.log("[2/2] Triggering quest generation...");
    const quests = await service.generateShortageQuests();

    console.log(`   Dynamic Quests Generated: ${quests.length}`);
    if (quests.length > 0) {
        const q = quests[0];
        console.log(`   Quest: "${q.name}" (ID: ${q.id})`);
        console.log(`   Expires: ${q.expiresAt.toISOString()}`);

        const stages = await prisma.questStage.findMany({ where: { questId: q.id }, include: { objectives: true } });
        console.log(`   Stages Found: ${stages.length}`);
        if (stages[0]) {
            console.log(`   Objective: ${stages[0].objectives[0].description} (Amount: ${stages[0].objectives[0].amount})`);
        }
    }

    // VERDICT
    const genPass = quests.length > 0 && quests[0].isDynamic;

    if (genPass) {
        console.log("\n🌟 FINAL VERDICT: MERCHANT QUEST GENERATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: GENERATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runQuestGenAudit().catch(err => console.error(err));
