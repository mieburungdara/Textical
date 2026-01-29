const questService = require('../services/questService');
const prisma = require('../db');

async function runQuestAudit() {
    console.log("--------------------------------------------------");
    console.log("📜 STARTING QUEST MODULAR AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;

    console.log("[1/3] Resetting State & Creating Templates...");
    await prisma.userQuest.deleteMany({ where: { userId } });
    
    // Ensure we have templates to pick from
    for (let i = 1; i <= 3; i++) {
        await prisma.questTemplate.upsert({
            where: { id: 9990 + i },
            update: {},
            create: {
                id: 9990 + i,
                name: `Audit Quest ${i}`,
                description: "Refactor validation test."
            }
        });
    }

    await prisma.user.update({
        where: { id: userId },
        data: { lastQuestResetAt: new Date(Date.now() - (90000 * 1000)) } 
    });

    console.log("[2/3] Testing Daily Refresh...");
    const active = await questService.getActiveQuests(userId);
    console.log(`   Daily Quests Generated: ${active.length} (Expected: 3)`);

    if (active.length === 3) {
        console.log("\n✅ QUEST AUDIT PASSED: RefreshSystem is working modularly.");
    } else {
        console.log("\n❌ QUEST AUDIT FAILED.");
    }
}

runQuestAudit().catch(err => console.error(err));
