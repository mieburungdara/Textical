const craftingService = require('../services/craftingService');
const inventoryService = require('../services/inventoryService');
const statService = require('../services/statService');
const prisma = require('../db');

async function runItemQualityAudit() {
    console.log("--------------------------------------------------");
    console.log("🏆 STARTING ITEM QUALITY TIERS MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 1; // Bronze Sword
    const ironIngotId = 2005;
    const regionId = 1;

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    
    // Comprehensive Cleanup for User 1
    const heroes = await prisma.hero.findMany({ where: { userId } });
    for (const h of heroes) {
        await prisma.heroEquipment.deleteMany({ where: { heroId: h.id } });
        await prisma.heroSkill.deleteMany({ where: { heroId: h.id } });
        await prisma.heroBuff.deleteMany({ where: { heroId: h.id } });
        await prisma.heroTrait.deleteMany({ where: { heroId: h.id } });
        await prisma.heroClassMastery.deleteMany({ where: { heroId: h.id } });
        await prisma.formationSlot.deleteMany({ where: { heroId: h.id } });
        await prisma.taskQueue.deleteMany({ where: { heroId: h.id } });
    }
    await prisma.itemInstanceTrait.deleteMany({ where: { itemInstance: { userId } } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });
    await prisma.hero.deleteMany({ where: { userId } });

    // Setup Hero (Level 60, Masterwork Threshold)
    const testHero = await prisma.hero.create({
        data: { userId, name: "Master Crafter", unitLevel: 60, isMain: true, classId: 1001 }
    });
    const testHeroId = testHero.id;

    // Provide materials
    await prisma.inventoryItem.create({ data: { userId, templateId: ironIngotId, quantity: 10 } });
    await prisma.user.update({ where: { id: userId }, data: { gold: 10000, currentRegion: regionId, vitality: 100 } });

    // Ensure High Surplus (600 units)
    await prisma.regionalExtractionStats.upsert({
        where: { regionId_templateId: { regionId, templateId: ironIngotId } },
        update: { volume24h: 600 },
        create: { regionId, templateId: ironIngotId, volume24h: 600 }
    });

    // Ensure Recipe
    await prisma.recipeTemplate.upsert({
        where: { id: recipeId },
        update: { resultItemId: 7001, craftTimeSeconds: 1 },
        create: { id: recipeId, name: "Bronze Sword Recipe", description: "Standard sword recipe.", resultItemId: 7001, craftTimeSeconds: 1 }
    });
    await prisma.recipeIngredient.deleteMany({ where: { recipeId } });
    await prisma.recipeIngredient.create({ data: { recipeId, itemId: ironIngotId, quantity: 3 } });

    // 1. Start Crafting
    console.log("[1/4] Crafting Bronze Sword (Level 60 Crafter, High Surplus)...");
    const task = await craftingService.startCrafting(userId, recipeId);
    console.log(`   Task Created: ${task.id}`);

    // 2. Complete Crafting
    console.log("[2/4] Completing crafting task...");
    await craftingService.completeCrafting(userId, task.id);

    const craftedItem = await prisma.inventoryItem.findFirst({
        where: { userId, templateId: 7001 },
        orderBy: { id: 'desc' }
    });

    console.log(`   Result Item ID: ${craftedItem ? craftedItem.id : 'N/A'}`);
    console.log(`   Result Quality: ${craftedItem ? craftedItem.quality : 'N/A'} (Expected: MASTERWORK)`);
    console.log(`   Result PowerScale: ${craftedItem ? craftedItem.powerScale : 'N/A'}x (Expected: 1.3)`);

    // 3. Verify Stats
    console.log("[3/4] Equipping and verifying scaled stats...");
    
    // Base stats (unarmed)
    const baseStats = await statService.calculateHeroStats(testHeroId);
    
    // Equip magical item
    await prisma.heroEquipment.create({
        data: { heroId: testHeroId, slotKey: "MAIN_HAND", itemInstanceId: craftedItem.id }
    });
    const finalStats = await statService.calculateHeroStats(testHeroId);

    const atkBoost = finalStats.attack_damage - baseStats.attack_damage;
    // Template 7001 ATK is 15.
    // Masterwork (1.3x) should be 15 * 1.3 = 19.5
    console.log(`   Base ATK Boost (Template): 15`);
    console.log(`   Actual ATK Boost (Scaled): ${atkBoost}`);

    // VERDICT
    const qualityPass = craftedItem && craftedItem.quality === "MASTERWORK" && craftedItem.powerScale === 1.3;
    const statPass = atkBoost > 15;

    if (qualityPass && statPass) {
        console.log("\n🌟 FINAL VERDICT: ITEM QUALITY TIERS PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: QUALITY SYSTEM FAILURE.");
    }

    // Cleanup
    await prisma.heroEquipment.deleteMany({ where: { heroId: testHeroId } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.hero.delete({ where: { id: testHeroId } });

    console.log("\n--------------------------------------------------");
}

runItemQualityAudit().catch(err => console.error(err));