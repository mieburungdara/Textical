const craftingService = require('../services/craftingService');
const inventoryService = require('../services/inventoryService');
const prisma = require('../db');

async function runCraftingAffixAudit() {
    console.log("--------------------------------------------------");
    console.log("🛠️ STARTING CRAFTING AFFIX INTEGRITY AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const recipeId = 1; // Assuming Bronze Sword Recipe exists
    const fireEssenceId = 3001;

    // 0. Setup: Ensure recipe, materials and vitality
    console.log("[0/3] Preparing materials and recipe...");
    
    // Ensure Bronze Sword Template exists
    await prisma.itemTemplate.upsert({
        where: { id: 7001 },
        update: { category: "EQUIPMENT" },
        create: { id: 7001, name: "Bronze Sword", description: "A basic sword.", category: "EQUIPMENT" }
    });

    // Ensure Recipe exists
    await prisma.recipeTemplate.upsert({
        where: { id: 1 },
        update: { resultItemId: 7001, craftTimeSeconds: 1 },
        create: { id: 1, name: "Bronze Sword Recipe", description: "Recipe for sword", resultItemId: 7001, craftTimeSeconds: 1 }
    });

    // Clear and give materials
    const heroes = await prisma.hero.findMany({ where: { userId } });
    for (const h of heroes) await prisma.heroEquipment.deleteMany({ where: { heroId: h.id } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });

    await inventoryService.addItem(userId, fireEssenceId, 1);
    await prisma.user.update({ where: { id: userId }, data: { energy: 100, currentRegion: 1 } });

    // 1. Start Crafting with Affix
    console.log("[1/3] Starting crafting with Fire Essence...");
    const task = await craftingService.startCrafting(userId, 1, fireEssenceId);
    console.log(`   Task Created: ${task.id} (Affix Material: ${task.affixMaterialId})`);

    // 2. Complete Crafting
    console.log("[2/3] Completing crafting task...");
    await craftingService.completeCrafting(userId, task.id);

    // 3. Verify Result
    const item = await prisma.inventoryItem.findFirst({
        where: { userId, templateId: 7001 },
        include: { instanceTraits: { include: { trait: true } } }
    });

    console.log(`   Crafted Item: ${item ? item.templateId : 'NOT FOUND'}`);
    if (item) {
        console.log(`   Instance Traits Count: ${item.instanceTraits.length}`);
        if (item.instanceTraits.length > 0) {
            console.log(`   Trait Found: ${item.instanceTraits[0].trait.name} (Expected: FLAME_STRIKE)`);
        }
    }

    // VERDICT
    const traitPass = item && item.instanceTraits.length > 0 && item.instanceTraits[0].trait.name === "FLAME_STRIKE";

    if (traitPass) {
        console.log("\n🌟 FINAL VERDICT: CRAFTING AFFIX INTEGRITY PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: INTEGRATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runCraftingAffixAudit().catch(err => console.error(err));
