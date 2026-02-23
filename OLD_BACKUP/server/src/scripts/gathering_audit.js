const gatheringService = require('../services/gatheringService');
const prisma = require('../db');

async function runGatheringAudit() {
    console.log("--------------------------------------------------");
    console.log("⛏️ STARTING GATHERING (MINING) MODULAR AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 999; 

    // Ensure hero exists and IS OWNED by the user
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { userId: userId },
        create: {
            id: heroId,
            userId: userId,
            name: "Mining Dummy",
            classId: 1001,
            hp_base: 500
        }
    });

    const resource = await prisma.regionResource.findFirst({
        where: { regionId: 1, itemId: 2201 } 
    });

    const testMining = async (str, label) => {
        await prisma.hero.update({ where: { id: heroId }, data: { str: str } });
        const task = await gatheringService.startGathering(userId, heroId, resource.id);
        
        const duration = (task.finishesAt - task.startedAt) / 1000;
        console.log(`   ${label.padEnd(10)} | STR: ${str.toString().padStart(2)} | Duration: ${duration}s`);
        
        await prisma.taskQueue.delete({ where: { id: task.id } });
        return duration;
    };

    console.log("[1/2] Comparing STR Impact on Hardness 1 (Granite)...");
    const d1 = await testMining(10, "Average");
    const d2 = await testMining(50, "Strong");
    const d3 = await testMining(5, "Weak");

    if (d2 < d1 && d1 < d3) {
        console.log("\n✅ GATHERING AUDIT PASSED: Strength correctly scales mining speed.");
    } else {
        console.log("\n❌ GATHERING AUDIT FAILED.");
    }
}

runGatheringAudit().catch(err => console.error(err));