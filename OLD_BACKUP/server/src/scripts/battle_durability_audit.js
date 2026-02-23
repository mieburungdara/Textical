const battleService = require('../services/battleService');
const formationService = require('../services/formationService');
const prisma = require('../db');

async function runBattleDurabilityAudit() {
    console.log("--------------------------------------------------");
    console.log("🛡️ STARTING BATTLE DURABILITY DEGRADATION AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39; // Arthur
    const monsterTemplateId = 6001; // Green Slime
    const regionId = 1;

    // 0. Setup: Hero with fresh gear and mapped monster
    console.log("[0/3] Preparing hero and formation...");
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    await prisma.inventoryItem.deleteMany({ where: { userId, templateId: 7001 } });

    // Ensure hero is in User 1's formation
    const preset = await prisma.formationPreset.findFirst({ where: { userId } });
    await prisma.formationSlot.deleteMany({ where: { presetId: preset.id } });
    await prisma.formationSlot.create({
        data: { presetId: preset.id, heroId, gridX: 25, gridY: 40 }
    });

    // Map monster to region 1 so it's available
    await prisma.regionMonster.deleteMany({ where: { regionId, monsterId: monsterTemplateId } });
    await prisma.regionMonster.create({
        data: { regionId, monsterId: monsterTemplateId }
    });

    const sword = await prisma.inventoryItem.create({
        data: { userId, templateId: 7001, quantity: 1, currentDurability: 100, maxDurability: 100 }
    });
    await prisma.heroEquipment.create({
        data: { heroId, slotKey: "MAIN_HAND", itemInstanceId: sword.id }
    });

    // 1. Run Battle
    console.log("[1/3] Simulating battle...");
    await battleService.startBattle(userId, monsterTemplateId);

    // 2. Check Durability
    const finalSword = await prisma.inventoryItem.findUnique({ where: { id: sword.id } });
    console.log(`   Initial Durability: 100`);
    console.log(`   Final Durability: ${finalSword.currentDurability}`);

    // VERDICT
    if (finalSword.currentDurability < 100) {
        console.log("\n🌟 FINAL VERDICT: BATTLE DURABILITY DEGRADATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: DURABILITY LOGIC FAILURE (No loss detected).");
    }

    // Cleanup
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    await prisma.inventoryItem.delete({ where: { id: sword.id } });

    console.log("\n--------------------------------------------------");
}

runBattleDurabilityAudit().catch(err => console.error(err));
