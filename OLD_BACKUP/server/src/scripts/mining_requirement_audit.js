const gatheringService = require('../services/gatheringService');
const prisma = require('../db');

async function runRequirementAudit() {
    console.log("--------------------------------------------------");
    console.log("🛡️ STARTING MINING REQUIREMENT AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 999; 

    // Setup hero with exactly 10 STR
    await prisma.hero.update({
        where: { id: heroId },
        data: { str: 10 }
    });

    const attemptMining = async (itemId, label) => {
        const resource = await prisma.regionResource.findFirst({
            where: { regionId: 1, itemId: itemId }
        });

        console.log(`   Attempting to mine ${label}...`);
        try {
            await gatheringService.startGathering(userId, heroId, resource.id);
            console.log(`   ✅ Success: Mining started.`);
            // Cleanup task
            const task = await prisma.taskQueue.findFirst({ where: { userId, status: "RUNNING" } });
            if (task) await prisma.taskQueue.delete({ where: { id: task.id } });
        } catch (e) {
            console.log(`   ⛔ Blocked: ${e.message}`);
        }
    };

    // 1. Granite (Req: 10 STR)
    await attemptMining(2201, "Granite (Req: 10 STR)");

    // 2. Adamantite (Req: 100 STR) - We need to add it to Region 1 for testing
    const adamantite = await prisma.itemTemplate.findUnique({ where: { id: 2221 } });
    await prisma.regionResource.upsert({
        where: { id: 999 }, // Mock ID
        update: {},
        create: { id: 999, regionId: 1, itemId: 2221, gatherTimeSeconds: 60 }
    });

    await attemptMining(2221, "Adamantite (Req: 100 STR)");

    console.log("\n--------------------------------------------------");
    console.log("Requirement Audit Complete.");
}

runRequirementAudit().catch(err => console.error(err));
