const gatheringService = require('../services/gatheringService');
const prisma = require('../db');

async function runSickleAudit() {
    console.log("--------------------------------------------------");
    console.log("🌿 STARTING HERBALISM SICKLE MULTIPLIER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 998; // Using the "Alchemist" hero from previous audit

    // 1. Setup Hero & Region
    console.log("[1/4] Setting up hero (INT: 40) and Region 1...");
    await prisma.user.update({ where: { id: userId }, data: { currentRegion: 1 } });
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { int: 40, userId: userId },
        create: { id: heroId, userId: userId, name: "Alchemist", classId: 1001, int: 40 }
    });

    const blueBlossom = await prisma.regionResource.findFirst({
        where: { regionId: 1, itemId: 2802 }
    });

    // 2. Baseline Test: Bare Hands
    console.log("[2/4] Testing Baseline (Bare Hands)...");
    await prisma.heroEquipment.deleteMany({ where: { heroId } }); // Clear equipment
    const task1 = await gatheringService.startGathering(userId, heroId, blueBlossom.id);
    const dur1 = (task1.finishesAt - task1.startedAt) / 1000;
    
    // Calculation: statValue = 40. Duration = ceil(8 / (40/10)) = 2s.
    console.log(`   Duration (Hands): ${dur1}s (Base: 8s, INT: 40 -> 2s expected)`);
    await prisma.taskQueue.delete({ where: { id: task1.id } });

    // 3. Sickle Test: Mithril Sickle (2.0x Multiplier)
    console.log("[3/4] Testing Mithril Sickle (2.0x multiplier)...");
    const sickleTemplateId = 3604; // Mithril Sickle
    
    // Grant item
    const sickleInstance = await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: sickleTemplateId } },
        update: { quantity: 1 },
        create: { userId, templateId: sickleTemplateId, quantity: 1 }
    });

    // Equip it
    await prisma.heroEquipment.upsert({
        where: { heroId_slotKey: { heroId, slotKey: "MAIN_HAND" } },
        update: { itemInstanceId: sickleInstance.id },
        create: { heroId, slotKey: "MAIN_HAND", itemInstanceId: sickleInstance.id }
    });

    const task2 = await gatheringService.startGathering(userId, heroId, blueBlossom.id);
    const dur2 = (task2.finishesAt - task2.startedAt) / 1000;
    
    // Calculation: statValue = 40 * 2.0 = 80. Duration = ceil(8 / (80/10)) = 1s.
    console.log(`   Duration (Sickle): ${dur2}s (Effective INT: 80 -> 1s expected)`);
    await prisma.taskQueue.delete({ where: { id: task2.id } });

    // 4. Result
    if (dur1 === 2 && dur2 === 1) {
        console.log("\n🌟 FINAL VERDICT: HERBALISM SICKLE MULTIPLIER WORKS PERFECTLY.");
    } else {
        console.log(`\n❌ FINAL VERDICT: MISMATCH. dur1:${dur1}, dur2:${dur2}`);
    }

    console.log("\n--------------------------------------------------");
}

runSickleAudit().catch(err => console.error(err));
