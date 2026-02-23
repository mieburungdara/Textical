const gatheringService = require('../services/gatheringService');
const prisma = require('../db');

async function runFishingRodAudit() {
    console.log("--------------------------------------------------");
    console.log("🎣 STARTING FISHING ROD MULTIPLIER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 997; // Using the "Angler" hero from previous audit

    // 1. Setup Hero & Region
    console.log("[1/4] Setting up hero (DEX: 40) and Region 4...");
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: 4 } });
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { dex: 40, userId: userId },
        create: { id: heroId, userId: userId, name: "Angler", classId: 1001, dex: 40 }
    });

    const moonCarp = await prisma.regionResource.findFirst({
        where: { regionId: 4, itemId: 3311 }
    });

    // 2. Baseline Test: Bare Hands
    console.log("[2/4] Testing Baseline (Bare Hands)...");
    await prisma.heroEquipment.deleteMany({ where: { heroId } }); // Clear equipment
    const task1 = await gatheringService.startGathering(userId, heroId, moonCarp.id);
    const dur1 = (task1.finishesAt - task1.startedAt) / 1000;
    console.log(`   Duration (Hands): ${dur1}s (Base: 10s, DEX: 40 -> 3s expected)`);
    await prisma.taskQueue.delete({ where: { id: task1.id } });

    // 3. Rod Test: Iron Fishing Rod (1.25x Multiplier)
    console.log("[3/4] Testing Iron Fishing Rod (1.25x multiplier)...");
    const rodTemplateId = 3502; // Iron Fishing Rod
    
    // Grant item
    const rodInstance = await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: rodTemplateId } },
        update: { quantity: 1 },
        create: { userId, templateId: rodTemplateId, quantity: 1 }
    });

    // Equip it
    await prisma.heroEquipment.upsert({
        where: { heroId_slotKey: { heroId, slotKey: "MAIN_HAND" } },
        update: { itemInstanceId: rodInstance.id },
        create: { heroId, slotKey: "MAIN_HAND", itemInstanceId: rodInstance.id }
    });

    const task2 = await gatheringService.startGathering(userId, heroId, moonCarp.id);
    const dur2 = (task2.finishesAt - task2.startedAt) / 1000;
    
    // Calculation: statValue = 40 * 1.25 = 50. Duration = ceil(10 / (50/10)) = 2s.
    console.log(`   Duration (Rod): ${dur2}s (Effective DEX: 50 -> 2s expected)`);
    await prisma.taskQueue.delete({ where: { id: task2.id } });

    // 4. Result
    if (dur1 === 3 && dur2 === 2) {
        console.log("\n🌟 FINAL VERDICT: FISHING ROD MULTIPLIER WORKS PERFECTLY.");
    } else {
        console.log(`\n❌ FINAL VERDICT: MISMATCH. dur1:${dur1}, dur2:${dur2}`);
    }

    console.log("\n--------------------------------------------------");
}

runFishingRodAudit().catch(err => console.error(err));
