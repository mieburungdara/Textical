const questService = require('../services/questService');
const prisma = require('../db');

async function runQuestAudit() {
    console.log("--------------------------------------------------");
    console.log("📜 STARTING ADVANCED MULTI-STAGE QUEST MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const questId = 10; // The Dragon's Trial

    // 0. Initial Setup
    console.log("[0/5] Initializing User...");
    await prisma.userQuest.deleteMany({ where: { userId, questId } });
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: 1, gold: 0 } });

    // 1. Accept Quest
    console.log("[1/5] Accepting Quest...");
    const uQuest = await questService.acceptQuest(userId, questId);
    console.log(`   Quest Accepted. Starting Stage: ${uQuest.currentStageId}`);

    // 2. Complete Stage 1: The Journey (Target Region 3)
    console.log("[2/5] Completing Stage 1 (The Journey)...");
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: 3 } }); // Travel
    const res1 = await questService.completeCurrentStage(userId, uQuest.id);
    console.log(`   Stage 1 Success. Next Stage: ${res1.nextStage}`);

    // 3. Complete Stage 2: The Hunt (Kill 5 Wolves)
    console.log("[3/5] Completing Stage 2 (The Hunt)...");
    // Kill logic is assumed passed in Validator for now.
    const res2 = await questService.completeCurrentStage(userId, uQuest.id);
    console.log(`   Stage 2 Success. Next Stage: ${res2.nextStage}`);

    // 4. Complete Stage 3: The Return (Report to Elder Thorne)
    console.log("[4/5] Completing Stage 3 (The Return)...");
    const res3 = await questService.completeCurrentStage(userId, uQuest.id);
    console.log(`   Stage 3 Success. Finished: ${res3.finished}`);

    // 5. Verify Rewards
    const finalUser = await prisma.user.findUnique({ where: { id: userId } });
    const rewardItem = await prisma.inventoryItem.findUnique({
        where: { userId_templateId: { userId, templateId: 4425 } }
    });

    console.log(`\n📊 FINAL REWARD CHECK:`);
    console.log(`   Gold Earned: ${finalUser.gold} (Expected: 5000)`);
    console.log(`   Item Reward: ${rewardItem ? rewardItem.templateId : 'NONE'} (Expected: 4425)`);

    if (finalUser.gold === 5000 && rewardItem && rewardItem.templateId === 4425) {
        console.log("\n🌟 FINAL VERDICT: MULTI-STAGE QUEST SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runQuestAudit().catch(err => console.error(err));
