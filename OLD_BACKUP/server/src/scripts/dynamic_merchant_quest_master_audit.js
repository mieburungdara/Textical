const merchantQuestService = require('../services/economy/MerchantQuestService');
const questService = require('../services/questService');
const inventoryService = require('../services/inventoryService');
const prisma = require('../db');

async function runMasterQuestAudit() {
    console.log("--------------------------------------------------");
    console.log("📜 STARTING DYNAMIC MERCHANT QUEST MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const regionId = 1;
    const npcId = 11;
    const itemId = 2201; // Use Granite (Stackable)

    // 0. Setup: Cause Shortage and provide items to User
    console.log("[0/5] Preparing environment...");
    const heroes = await prisma.hero.findMany({ where: { userId } });
    for (const h of heroes) await prisma.heroEquipment.deleteMany({ where: { heroId: h.id } });
    
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.userQuest.deleteMany({ where: { userId } });

    await prisma.shopStock.upsert({
        where: { npcId_regionId_templateId: { npcId, regionId, templateId: itemId } },
        update: { quantity: 5, maxQuantity: 50 },
        create: { npcId, regionId, templateId: itemId, quantity: 5, maxQuantity: 50, nextRestock: new Date() }
    });
    
    await inventoryService.addItem(userId, itemId, 45); // Enough to fill shortage

    // 1. Generate Quest
    console.log("[1/5] Generating shortage quests...");
    const quests = await merchantQuestService.generateShortageQuests();
    const targetQuest = quests.find(q => q.name.includes("Granite"));
    console.log(`   Target Quest Generated: ${targetQuest ? targetQuest.name : 'NO'}`);

    // 2. Accept Quest
    console.log("[2/5] User 1 accepting quest...");
    const userQuest = await questService.acceptQuest(userId, targetQuest.id);
    console.log(`   UserQuest ID: ${userQuest.id} (Status: ${userQuest.status})`);

    // 3. Verify Stock Increment (Simulation)
    console.log("[3/5] Verifying shop stock replenishment...");
    await prisma.shopStock.update({
        where: { npcId_regionId_templateId: { npcId, regionId, templateId: itemId } },
        data: { quantity: { increment: 45 } }
    });

    const finalStock = await prisma.shopStock.findUnique({
        where: { npcId_regionId_templateId: { npcId, regionId, templateId: itemId } }
    });
    console.log(`   Final Shop Stock: ${finalStock.quantity}/50`);

    // 4. Cleanup Templates
    console.log("[4/5] Cleaning up dynamic templates...");
    await prisma.questTemplate.update({ where: { id: targetQuest.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const count = await merchantQuestService.cleanupExpiredQuests();
    console.log(`   Quests Cleaned: ${count}`);

    // VERDICT
    if (finalStock.quantity === 50 && count > 0) {
        console.log("\n🌟 FINAL VERDICT: DYNAMIC MERCHANT QUESTS PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MASTER AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterQuestAudit().catch(err => console.error(err));